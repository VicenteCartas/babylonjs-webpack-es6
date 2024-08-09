import { Color4, Texture, Vector2 } from "@babylonjs/core";

export type TilEdMapOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
export type TilEdMapRenderOrder = 'right-down' | 'right-up' | 'left-down' | 'left-up';
export type TilEdMapStaggerAxis = 'x' | 'y';
export type TilEdMapStaggerIndex = 'even' | 'odd';
export type TilEdLayerEncoding = 'csv' | 'base64';

export class TilEdMap {
    version: string = '';
    tiledVersion: string = '';
    orientation: TilEdMapOrientation = 'orthogonal';
    renderorder: TilEdMapRenderOrder = 'right-down';
    height: number = 0;
    width: number = 0;
    tileHeight: number = 0;
    tileWidth: number = 0;
    hexSideLength?: number = undefined;
    staggerAxis?: TilEdMapStaggerAxis = undefined;
    staggerIndex?: TilEdMapStaggerIndex = undefined;
    tilesets: TilEdTileset[] = [];
    layers: TilEdLayer[] = [];
}

export class TilEdTileset {
    firstgid: number = 0;
    name: string = '';
    tileWidth: number = 0;
    tileHeight: number = 0;
    spacing: number = 0;
    margin: number = 0;
    tileCount: number = 0;
    columns: number = 0;
    image?: Texture;
    tiles?: TilEdTilesetTile[];
}


export class TilEdTilesetTile {
    id: number = 0;
    image?: Texture;
}

export class TilEdLayer {
    name: string = '';
    width: number = 0;
    height: number = 0;
    opacity: number = 1;
    visible: boolean = true;
    tintColor?: Color4;
    offsetX: number = 0;
    offsetY: number = 0;
    encoding: TilEdLayerEncoding = 'csv';
    data: number[] = [];
}

export interface ITilEdSpriteMap {
    getMapPixelSize(): Vector2;
    renderToTexture() : Promise<Texture>;
}