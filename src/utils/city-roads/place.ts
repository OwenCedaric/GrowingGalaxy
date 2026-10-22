// @ts-ignore
import Pbf from './pbf.js';

export interface PlaceNode {
    id: number;
    lat: number;
    lon: number;
}

export interface PlaceWay {
    nodes: number[];
}

export interface PlaceData {
    version: number;
    name: string;
    date: string;
    id: string;
    nodes: PlaceNode[];
    ways: PlaceWay[];
}

export const placeReader = {
    read(pbf: any, end?: number): PlaceData {
        return pbf.readFields(placeReader._readField, {
            version: 0,
            name: "",
            date: "",
            id: "",
            nodes: [],
            ways: []
        }, end);
    },

    _readField(tag: number, obj: PlaceData, pbf: any) {
        if (tag === 1) obj.version = pbf.readVarint();
        else if (tag === 2) obj.name = pbf.readString();
        else if (tag === 3) obj.date = pbf.readString();
        else if (tag === 4) obj.id = pbf.readString();
        else if (tag === 5) obj.nodes.push(placeReader.readNode(pbf, pbf.readVarint() + pbf.pos));
        else if (tag === 6) obj.ways.push(placeReader.readWay(pbf, pbf.readVarint() + pbf.pos));
    },

    readNode(pbf: any, end?: number): PlaceNode {
        return pbf.readFields(placeReader._readNodeField, { id: 0, lat: 0, lon: 0 }, end);
    },

    _readNodeField(tag: number, obj: PlaceNode, pbf: any) {
        if (tag === 1) obj.id = pbf.readVarint();
        else if (tag === 2) obj.lat = pbf.readFloat();
        else if (tag === 3) obj.lon = pbf.readFloat();
    },

    readWay(pbf: any, end?: number): PlaceWay {
        return pbf.readFields(placeReader._readWayField, { nodes: [] }, end);
    },

    _readWayField(tag: number, obj: PlaceWay, pbf: any) {
        if (tag === 1) pbf.readPackedVarint(obj.nodes);
    }
};

export function decodePbf(buffer: ArrayBuffer): PlaceData {
    const pbfInstance = new (Pbf as any)(buffer);
    return placeReader.read(pbfInstance);
}
