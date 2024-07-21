import { Color4 } from "@babylonjs/core";

export type TilEdMapOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
export type TilEdMapRenderOrder = 'right-down' | 'right-up' | 'left-down' | 'left-up';
export type TilEdMapStaggerAxis = 'x' | 'y';
export type TilEdMapStaggerIndex = 'even' | 'odd';
export type TilEdLayerEncoding = 'csv' | 'base64';

export class TilEdMap {
    version: string | null = null;
    tiledVersion: string | null = null;
    orientation: TilEdMapOrientation = 'orthogonal';
    renderorder: TilEdMapRenderOrder = 'right-down';
    height: number = 0;
    width: number = 0;
    tileHeight: number = 0;
    tileWidth: number = 0;
    hexSideLength: number | null = null;
    staggerAxis: TilEdMapStaggerAxis | null = null;
    staggerIndex: TilEdMapStaggerIndex | null = null;
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
    source: string = '';
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
    opacity: number = 0;
    visible: boolean = true;
    tintColor: Color4 = new Color4(0, 0, 0, 0);
    offsetX: number = 0;
    offsetY: number = 0;
    encoding: TilEdLayerEncoding = 'csv';
    data: number[] = [];
}