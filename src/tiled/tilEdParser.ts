import { Color4 } from "@babylonjs/core";
import {
    TilEdLayer,
    TilEdLayerEncoding,
    TilEdMap,
    TilEdMapOrientation,
    TilEdMapRenderOrder,
    TilEdMapStaggerAxis,
    TilEdMapStaggerIndex,
    TilEdTileset,
    TilEdTilesetImage,
    TilEdTilesetTile
} from "./tilEd.types";

export class TilEdParser {
    public static parseMapData(mapData: string) : TilEdMap {
        // https://gist.github.com/prof3ssorSt3v3/61ccf69758cd6dbdc429934564864650
        let parser = new DOMParser();
        let xmlData = parser.parseFromString(mapData, 'application/xml');
        let mapNode = xmlData.documentElement;
        
        const map = new TilEdMap();

        // Parse the map data
        map.version = mapNode.getAttribute('version') ?? '';
        map.tiledVersion = mapNode.getAttribute('tiledversion');
        map.orientation = this.parseStringAttribute(mapNode, 'orientation') as TilEdMapOrientation;
        map.renderorder = this.parseStringAttribute(mapNode, 'renderorder') as TilEdMapRenderOrder;
        map.width = this.parseNumberAttribute(mapNode, 'width');
        map.height = this.parseNumberAttribute(mapNode, 'height');
        map.tileWidth = this.parseNumberAttribute(mapNode, 'tilewidth');
        map.tileHeight = this.parseNumberAttribute(mapNode, 'tileheight');
        map.hexSideLength = this.parseNumberAttribute(mapNode, 'hexsidelength');
        map.staggerAxis = this.parseStringAttribute(mapNode, 'staggeraxis') as TilEdMapStaggerAxis;
        map.staggerIndex = this.parseStringAttribute(mapNode, 'staggerindex') as TilEdMapStaggerIndex;

        // Parse all tilesets
        map.tilesets = this.parseTilesets(mapNode);

        // Parse all layers
        map.layers = this.parseLayers(mapNode);
        
        return map;
    }

    private static parseTilesets(mapElement: HTMLElement) : TilEdTileset[] {
        const tilesets: TilEdTileset[] = [];
        const tilesetElements = mapElement.getElementsByTagName('tileset');

        if (tilesetElements) {
            for (let i = 0; i < tilesetElements.length; i++) {
                const tilesetElement = tilesetElements.item(i);
                if (tilesetElement) {
                    tilesets.push(TilEdParser.parseTileset(tilesetElement));
                }
            }
        }

        return tilesets;
    }

    private static parseTileset(tilesetElement: Element): TilEdTileset {
        const tileset = new TilEdTileset();

        // Test if tileset is local or not

        tileset.name = TilEdParser.parseStringAttribute(tilesetElement, 'name');
        tileset.tileWidth = TilEdParser.parseNumberAttribute(tilesetElement, 'tilewidth');
        tileset.tileHeight = TilEdParser.parseNumberAttribute(tilesetElement, 'tileheight');
        tileset.spacing = TilEdParser.parseNumberAttribute(tilesetElement, 'spacing');
        tileset.margin = TilEdParser.parseNumberAttribute(tilesetElement, 'margin');
        tileset.tileCount = TilEdParser.parseNumberAttribute(tilesetElement, 'tilecount');
        tileset.columns = TilEdParser.parseNumberAttribute(tilesetElement, 'columns');
        tileset.image = TilEdParser.parseTilesetImage(tilesetElement.getElementsByTagName('image'));
        tileset.tiles = TilEdParser.parseTilesetTiles(tilesetElement.getElementsByTagName('tile'));

        return tileset;
    }

    private static parseTilesetImage(imageElements: HTMLCollection) : TilEdTilesetImage | undefined {
        if (imageElements.length > 0) {
            const imageElement = imageElements.item(0);
            if (imageElement) {
                const tilesetImage = new TilEdTilesetImage();
                tilesetImage.source = TilEdParser.parseStringAttribute(imageElement, 'source');;
                tilesetImage.width = TilEdParser.parseNumberAttribute(imageElement, 'width'); 
                tilesetImage.height = TilEdParser.parseNumberAttribute(imageElement, 'height');

                return tilesetImage;
            }
        }

        return undefined;
    }

    private static parseTilesetTiles(tileElements: HTMLCollection) : TilEdTilesetTile[] | undefined {
        const tiles: TilEdTilesetTile[] = [];
        for (let i = 0; i < tileElements.length; i++) {
            const tileElement = tileElements.item(0);
            if (tileElement) {
                const tile = new TilEdTilesetTile();
                tile.id = TilEdParser.parseNumberAttribute(tileElement, 'id');
                tile.image = TilEdParser.parseTilesetImage(tileElement.getElementsByTagName('image')) as TilEdTilesetImage; 

                tiles.push(tile);
            }
        }

        if (tiles.length === 0) {
            return undefined;
        }

        return tiles;
    }

    private static parseLayers(mapElement: HTMLElement): TilEdLayer[] {
        const layers: TilEdLayer[] = [];
        const layerElements = mapElement.getElementsByTagName('layer');

        if (layerElements) {
            for (let i = 0; i < layerElements.length; i++) {
                const layerElement = layerElements.item(i);
                if (layerElement) {
                    layers.push(TilEdParser.parseLayer(layerElement));
                }
            }
        }

        return layers;
    }
    
    private static parseLayer(layerElement: Element): TilEdLayer {
        const layer: TilEdLayer = new TilEdLayer();

        // Parse the layer data
        layer.name = TilEdParser.parseStringAttribute(layerElement, 'name');
        layer.width = TilEdParser.parseNumberAttribute(layerElement, 'width');
        layer.height = TilEdParser.parseNumberAttribute(layerElement, 'height');
        layer.opacity = TilEdParser.parseNumberAttribute(layerElement, 'opacity');
        layer.visible = TilEdParser.parseBooleanAttribute(layerElement, 'visible');
        layer.tintColor = TilEdParser.parseColor4Attribute(layerElement, 'visible');
        layer.offsetX = TilEdParser.parseNumberAttribute(layerElement, 'offsetx');
        layer.offsetY = TilEdParser.parseNumberAttribute(layerElement, 'offsety');

        // Read the layer data
        const dataElement = layerElement.getElementsByTagName('data').item(0);
        if (dataElement) {
            layer.encoding = TilEdParser.parseStringAttribute(dataElement, 'encoding') as TilEdLayerEncoding;
            layer.data = TilEdParser.parseLayerData(dataElement, layer.encoding);
        }

        return layer;
    }

    private static parseLayerData(dataElement: Element, encoding: TilEdLayerEncoding): number[] {
        if (encoding === 'csv') {
            return TilEdParser.parseCsvLayerData(dataElement.textContent);
        } else if (encoding == 'base64') {
            return TilEdParser.parseBase64LayerData(dataElement.textContent);
        } else {
            throw new Error('Unknown encoding ' + encoding + ' in node ' + dataElement.tagName);
        }
    }

    private static parseCsvLayerData(data: string | null) : number[] {
        if (!data) {
            return [];
        }

        const split = data.replaceAll('\r\n', '').split(',');
        return split.map((value: string) => { 
            return parseInt(value);
        });
    }

    private static parseBase64LayerData(data: string | null) : number[] {
        if (!data) {
            return [];
        }

        return this.parseCsvLayerData(atob(data));
    }
    
    private static parseStringAttribute(element: Element, name: string) : string {
        let textValue = element.getAttribute(name);

        if (!textValue) {
            throw new Error('Error parsing attribute ' + name + ' from node: ' + element.nodeName);
        }

        return textValue;
    }

    private static parseBooleanAttribute(element: Element, name: string) : boolean {
        const number = TilEdParser.parseNumberAttribute(element, name);
        if (number === 0) {
            return false;
        }

        return true;
    }

    private static parseNumberAttribute(element: Element, name: string) : number {
        let textValue = element.getAttribute(name);
        let numberValue = 0;

        if (textValue) {
            numberValue = parseInt(textValue);
        }

        if (Number.isNaN(numberValue) || !textValue) {
            throw new Error('Error parsing attribute ' + name + ' from node: ' + element.nodeName);
        }

        return numberValue;
    }

    private static parseColor4Attribute(element: Element, name: string) : Color4 {
        let textValue = element.getAttribute(name);

        if (!textValue) {
            throw new Error('Error parsing attribute ' + name + ' from node: ' + element.nodeName);
        }

        if (textValue.charAt(0) === '#') {
            textValue = textValue.slice(1);
        }

        let color = new Color4();
        if (textValue.length === 6) {
            color.r = parseInt(textValue.substring(0, 2), 16);
            color.g = parseInt(textValue.substring(2, 2), 16);
            color.b = parseInt(textValue.substring(4, 2), 16);
        } else {
            color.a = parseInt(textValue.substring(0, 2), 16);
            color.r = parseInt(textValue.substring(2, 2), 16);
            color.g = parseInt(textValue.substring(4, 2), 16);
            color.b = parseInt(textValue.substring(6, 2), 16);
        }

        return color;
    }
}