/// <reference types="@cloudflare/workers-types" />
import { MCP_CONFIG } from '../mcp.config';

export interface Env {
  VECTORIZE: VectorizeIndex;
  AI: any;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // MCP 路由分发
    if (url.pathname.startsWith(MCP_CONFIG.routes.base)) {
      if (request.method === 'OPTIONS') {
        return handleCors(request);
      }
      return (await handleMcpRequest(url, request, env)).clone();
    }

    // 默认回退到静态资源
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
  const { routes, server, ai, search } = MCP_CONFIG;

  // 1. 处理 GET 请求 (SSE 握手与元数据)
  if (request.method === 'GET') {
    if (path === routes.version) {
        return new Response(JSON.stringify({ version: server.version }), { headers: corsHeaders() });
    }
    
    if (path === routes.listDocs) {
      const res = await env.ASSETS.fetch(new Request(new URL(routes.indexJson, request.url)));
      if (!res.ok) return new Response(JSON.stringify({ error: "Index Error" }), { status: 500, headers: corsHeaders() });
      return new Response(await res.text(), { headers: corsHeaders() });
    }

    if (path === routes.base) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        const endpoint = new URL(routes.message, request.url).toString();
        writer.write(encoder.encode(`event: endpoint\ndata: ${endpoint}\n\n`));
        
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

  // 2. 处理 POST 请求 (JSON-RPC 与遗留 API)
  if (request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { method, params, id, jsonrpc } = body;

      if (method || jsonrpc === "2.0") {
        if (method === 'initialize') {
          return mcpResponse(id, {
            protocolVersion: server.protocolVersion,
            capabilities: { tools: {}, resources: {} },
            serverInfo: { name: server.name, version: server.version }
          });
        }
        
        if (!id) return new Response(null, { status: 204, headers: corsHeaders() });
        if (method === 'notifications/initialized') return new Response(null, { status: 204, headers: corsHeaders() });

        if (method === 'tools/list') {
          return mcpResponse(id, {
            tools: [
              {
                name: "search",
                description: "Semantically search the blog and pages.",
                inputSchema: {
                  type: "object",
                  properties: { query: { type: "string" }, top_k: { type: "number", default: search.defaultTopK } },
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
            const aiResp = await env.AI.run(ai.cloudflareModel, { text: args.query });
            const m = await env.VECTORIZE.query(aiResp.data[0], { topK: args.top_k || search.defaultTopK, returnMetadata: 'all' });
            return mcpResponse(id, { content: [{ type: "text", text: JSON.stringify({ results: m.matches.map((x: any) => ({ chunk_id: x.id, score: x.score, metadata: x.metadata })) }) }] });
          }
          if (name === 'get_context' && args?.chunk_ids) {
            const chunks = await env.VECTORIZE.getByIds(args.chunk_ids);
            return mcpResponse(id, { content: [{ type: "text", text: JSON.stringify({ context: chunks.map((m: any) => ({ chunk_id: m.id, text: m.metadata?.text, url: m.metadata?.url, canonical_url: m.metadata?.canonical_url })) }) }] });
          }
        }
        
        return mcpResponse(id, {});
      }

      // 处理遗留自定义 POST API
      if (path === routes.search && body.query) {
        const aiResp = await env.AI.run(ai.cloudflareModel, { text: body.query });
        const m = await env.VECTORIZE.query(aiResp.data[0], { topK: body.top_k || search.defaultTopK, returnMetadata: 'all' });
        return new Response(JSON.stringify({ results: m.matches.map((x: any) => ({ chunk_id: x.id, score: x.score, metadata: x.metadata })) }), { headers: corsHeaders() });
      }
      
      if (path === routes.context && body.chunk_ids) {
        const chunks = await env.VECTORIZE.getByIds(body.chunk_ids);
        return new Response(JSON.stringify({ context: chunks.map((m: any) => ({ chunk_id: m.id, text: m.metadata?.text, url: m.metadata?.url, canonical_url: m.metadata?.canonical_url })) }), { headers: corsHeaders() });
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
