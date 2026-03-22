export interface Env {
  VECTORIZE: VectorizeIndex;
  AI: any;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // MCP routes logic
    if (url.pathname.startsWith('/mcp')) {
      if (request.method === 'OPTIONS') {
        return handleCors(request);
      }
      return (await handleMcpRequest(url, request, env)).clone();
    }

    // Default: Fallback to static assets
    // The "assets" binding implicitly manages resolving static sites. 
    // In Workers, returning env.ASSETS.fetch(request) passes the request to the asset router.
    return env.ASSETS.fetch(request);
  }
}

function handleCors(request: Request): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
}

async function handleMcpRequest(url: URL, request: Request, env: Env): Promise<Response> {
  const path = url.pathname;

  // 1. Handle GET Requests (SSE Handshake + Metadata)
  if (request.method === 'GET') {
    if (path === '/mcp/version') return new Response(JSON.stringify({ version: "1.3" }), { headers: corsHeaders() });
    
    if (path === '/mcp/list_docs') {
      const res = await env.ASSETS.fetch(new Request(new URL('/mcp/index.json', request.url)));
      if (!res.ok) return new Response(JSON.stringify({ error: "Index Error" }), { status: 500, headers: corsHeaders() });
      return new Response(await res.text(), { headers: corsHeaders() });
    }

    // Standard MCP SSE Handshake (Claude Code/Official SDK)
    if (path === '/mcp') {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        // Return the POST endpoint as an SSE event
        const endpoint = new URL('/mcp/message', request.url).toString();
        writer.write(encoder.encode(`event: endpoint\ndata: ${endpoint}\n\n`));
        
        // Close the stream immediately or keep it open?
        // Standard MCP over HTTP expects the SSE stream to be the notification channel.
        // We'll keep it open but effectively empty for now.
        return new Response(readable, { 
            headers: { 
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            } 
        });
    }
  }

  // 2. Handle POST Requests (JSON-RPC + Legacy Custom API)
  if (request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { method, params, id, jsonrpc } = body;

      // Logic: If it has 'method', treat it as a potential MCP JSON-RPC call
      if (method || jsonrpc === "2.0") {
        if (method === 'initialize') {
          return mcpResponse(id, {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {}, resources: {} },
            serverInfo: { name: "growing-galaxy-mcp", version: "1.4.0" }
          });
        }
        
        // Handle Notifications (e.g. notifications/initialized) - return 204 No Content
        if (!id) {
          return new Response(null, { status: 204, headers: corsHeaders() });
        }

        if (method === 'notifications/initialized') {
          return new Response(null, { status: 204, headers: corsHeaders() });
        }

        if (method === 'tools/list') {
          return mcpResponse(id, {
            tools: [
              {
                name: "search",
                description: "Semantically search the blog and pages.",
                inputSchema: {
                  type: "object",
                  properties: { query: { type: "string" }, top_k: { type: "number", default: 5 } },
                  required: ["query"]
                }
              },
              {
                name: "get_context",
                description: "Retrieve original markdown content for specific chunks.",
                inputSchema: {
                  type: "object",
                  properties: { chunk_ids: { type: "array", items: { type: "string" } } },
                  required: ["chunk_ids"]
                }
              }
            ]
          });
        }
        if (method === 'tools/call') {
          const { name, arguments: args } = params || {};
          if (name === 'search' && args?.query) {
            const aiResp = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: args.query });
            const m = await env.VECTORIZE.query(aiResp.data[0], { topK: args.top_k || 5, returnMetadata: 'all' });
            return mcpResponse(id, { content: [{ type: "text", text: JSON.stringify({ results: m.matches.map(x => ({ chunk_id: x.id, score: x.score, metadata: x.metadata })) }) }] });
          }
          if (name === 'get_context' && args?.chunk_ids) {
            const chunks = await env.VECTORIZE.getByIds(args.chunk_ids);
            return mcpResponse(id, { content: [{ type: "text", text: JSON.stringify({ context: chunks.map(m => ({ chunk_id: m.id, text: m.metadata?.text, url: m.metadata?.url, canonical_url: m.metadata?.canonical_url })) }) }] });
          }
        }
        
        // If it was a valid method but we don't handle it, return an empty result to keep protocol happy
        return mcpResponse(id, {});
      }

      // Handle Legacy Custom POST API (Custom JSON Body)
      if (path === '/mcp/search' && body.query) {
        const aiResp = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: body.query });
        const m = await env.VECTORIZE.query(aiResp.data[0], { topK: body.top_k || 5, returnMetadata: 'all' });
        return new Response(JSON.stringify({ results: m.matches.map(x => ({ chunk_id: x.id, score: x.score, metadata: x.metadata })) }), { headers: corsHeaders() });
      }
      if (path === '/mcp/context' && body.chunk_ids) {
        const chunks = await env.VECTORIZE.getByIds(body.chunk_ids);
        return new Response(JSON.stringify({ context: chunks.map(m => ({ chunk_id: m.id, text: m.metadata?.text, url: m.metadata?.url, canonical_url: m.metadata?.canonical_url })) }), { headers: corsHeaders() });
      }

      return new Response(JSON.stringify({ error: "Method not found or invalid body", path, method }), { status: 404, headers: corsHeaders() });

    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders() });
    }
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders() });
}

function mcpResponse(id: any, result: any) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: corsHeaders()
  });
}

