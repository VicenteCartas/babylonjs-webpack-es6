import { Color4, IDisposable, Texture, Vector2 } from "@babylonjs/core";

export type TiledMapOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
export type TiledMapRenderOrder = 'right-down' | 'right-up' | 'left-down' | 'left-up';
export type TiledMapStaggerAxis = 'x' | 'y';
export type TiledMapStaggerIndex = 'even' | 'odd';
export type TiledLayerEncoding = 'csv' | 'base64';

export class TiledMap {
    version: string = '';
    tiledVersion: string = '';
    orientation: TiledMapOrientation = 'orthogonal';
    renderorder: TiledMapRenderOrder = 'right-down';
    height: number = 0;
    width: number = 0;
    tileHeight: number = 0;
    tileWidth: number = 0;
    hexSideLength?: number = undefined;
    staggerAxis?: TiledMapStaggerAxis = undefined;
    staggerIndex?: TiledMapStaggerIndex = undefined;
    tilesets: TiledTileset[] = [];
    layers: TiledLayer[] = [];
}

export class TiledTileset {
    firstgid: number = 0;
    name: string = '';
    tileWidth: number = 0;
    tileHeight: number = 0;
    spacing: number = 0;
    margin: number = 0;
    tileCount: number = 0;
    columns: number = 0;
    image?: Texture;
    tiles?: TiledTilesetTile[];
}


export class TiledTilesetTile {
    id: number = 0;
    image?: Texture;
}

export class TiledLayer {
    name: string = '';
    width: number = 0;
    height: number = 0;
    opacity: number = 1;
    visible: boolean = true;
    tintColor?: Color4;
    offsetX: number = 0;
    offsetY: number = 0;
    encoding: TiledLayerEncoding = 'csv';
    data: number[] = [];
}

export interface ISpriteMap2 extends IDisposable {
    getMapPixelSize(): Vector2;
    renderToTexture() : Promise<Texture>;
}