import { Color4 } from "@babylonjs/core";

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
    name: string = '';
    tileWidth: number = 0;
    tileHeight: number = 0;
    spacing: number = 0;
    margin: number = 0;
    tileCount: number = 0;
    columns: number = 0;
    image?: TilEdTilesetImage;
    tiles?: TilEdTilesetTile[];
}

export class TilEdTilesetImage {
    source: URL = new URL('https://www.babylonjs.com/');
    width: number = 0;
    height: number = 0;
}

export class TilEdTilesetTile {
    id: number = 0;
    image: TilEdTilesetImage = new TilEdTilesetImage();
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