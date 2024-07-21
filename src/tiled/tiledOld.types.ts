export type TilEdMap = {
    $: TilEdMapMetaData;
    tileset: TilEdTileset[];
    layer: TilEdLayer[];
}

export type TilEdMapMetaData = {
    version: string;
    tiledversion: string;
    orientation: TilEdOrientation;
    renderorder: TilEdRenderOrder;
    height: string;
    width: string;
    tileheight: string;
    tilewidth: string;
    hexsidelength: string;
    staggeraxis: TilEdStaggerAxis;
    staggerindex: TilEdStaggerIndex;
    infinite: string;
    nextobjectid: string;
    nextlayerid: string;
}

export type TilEdOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';

export type TilEdRenderOrder = 'right-down' | 'right-up' | 'left-down' | 'left-up';

export type TilEdStaggerAxis = 'x' | 'y';

export type TilEdStaggerIndex = 'even' | 'odd';

export type TilEdTileset = {
    $: TilEdEmbeddedTileSetMetaData,
    image: TilEdImage[]
}

export type TilEdEmbeddedTileSetMetaData = {
    firstgid: string;
    name: string;
    tilewidth: string;
    tileheight: string;
    tilecount: string;
    columns: string;
}

export type TilEdExternalTileSetMetaData = {
    firstgid: string;
    source: string;
}

export type TilEdTile = {
    id: string;
}

export type TilEdImage = {
    $: TilEdImageMetaData;
}

export type TilEdImageMetaData = {
    height: string;
    source: string;
    width: string;
}

export type TilEdLayer = {
    $: TilEdLayerMetaData;
    data: TilEdLayerData[];
}

export type TilEdLayerMetaData = {
    id: string;
    name: string;
    height: string;
    width: string;
}

export type TilEdLayerData = {
    _: string;
    $: TilEdLayerDataMetaData;
}

export type TilEdLayerDataMetaData = {
    encoding: TilEdLayerEncoding;
    compression: TilEdLayerCompression | undefined;
}

export type TilEdLayerEncoding = 'csv' | 'base64';

export type TilEdLayerCompression = 'gzip' | 'zlib' | 'zstd';