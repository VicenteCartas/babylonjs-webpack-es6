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
import { FileUtilities } from "./fileUtilities";

export class TilEdParser {
    public static async parseMapData(mapData: string, rootUrl: URL) : Promise<TilEdMap> {
        // https://gist.github.com/prof3ssorSt3v3/61ccf69758cd6dbdc429934564864650
        let parser = new DOMParser();
        let xmlData = parser.parseFromString(mapData, 'application/xml');
        let mapNode = xmlData.documentElement;
        
        const map = new TilEdMap();

        // Parse the map data
        map.version = this.parseStringAttribute(mapNode, 'version');
        map.tiledVersion = this.parseStringAttribute(mapNode, 'tiledversion');
        map.orientation = this.parseStringAttribute(mapNode, 'orientation') as TilEdMapOrientation;
        map.renderorder = this.parseStringAttribute(mapNode, 'renderorder') as TilEdMapRenderOrder;
        map.width = this.parseNumberAttribute(mapNode, 'width');
        map.height = this.parseNumberAttribute(mapNode, 'height');
        map.tileWidth = this.parseNumberAttribute(mapNode, 'tilewidth');
        map.tileHeight = this.parseNumberAttribute(mapNode, 'tileheight');
        map.hexSideLength = this.parseOptionalNumberAttribute(mapNode, 'hexsidelength');
        map.staggerAxis = mapNode.getAttribute('staggeraxis') as TilEdMapStaggerAxis;
        map.staggerIndex = mapNode.getAttribute('staggerindex') as TilEdMapStaggerIndex;

        // Parse all tilesets
        map.tilesets = await this.parseTilesets(mapNode, rootUrl);

        // Parse all layers
        map.layers = this.parseLayers(mapNode);
        
        return map;
    }

    private static async parseTilesets(mapElement: HTMLElement, rootUrl: URL) : Promise<TilEdTileset[]> {
        const tilesets: TilEdTileset[] = [];
        const tilesetElements = mapElement.getElementsByTagName('tileset');

        if (tilesetElements) {
            for (let i = 0; i < tilesetElements.length; i++) {
                const tilesetElement = tilesetElements.item(i);
                if (tilesetElement) {
                    tilesets.push(await TilEdParser.parseTileset(tilesetElement, rootUrl));
                }
            }
        }

        return tilesets;
    }

    private static async parseTileset(tilesetElement: Element, rootUrl: URL): Promise<TilEdTileset> {
        const tileset = new TilEdTileset();

        // Test if tileset is local or not
        const source = tilesetElement.getAttribute('source');
        if (source) {
            tilesetElement = await TilEdParser.parseRemoteTileset(source, rootUrl);
        }

        tileset.name = TilEdParser.parseStringAttribute(tilesetElement, 'name');
        tileset.tileWidth = TilEdParser.parseNumberAttribute(tilesetElement, 'tilewidth');
        tileset.tileHeight = TilEdParser.parseNumberAttribute(tilesetElement, 'tileheight');
        tileset.spacing = TilEdParser.parseNumberAttribute(tilesetElement, 'spacing', 0);
        tileset.margin = TilEdParser.parseNumberAttribute(tilesetElement, 'margin', 0);
        tileset.tileCount = TilEdParser.parseNumberAttribute(tilesetElement, 'tilecount');
        tileset.columns = TilEdParser.parseNumberAttribute(tilesetElement, 'columns');
        tileset.image = TilEdParser.parseTilesetImage(tilesetElement.children.item(0), rootUrl);
        tileset.tiles = TilEdParser.parseTilesetTiles(tilesetElement.getElementsByTagName('tile'), rootUrl);

        return tileset;
    }
 
    private static async parseRemoteTileset(tilesetUrl: string, rootUrl: URL) : Promise<Element>{
        const tilesetData = await FileUtilities.requestFile(new URL(tilesetUrl, rootUrl));
        let parser = new DOMParser();
        let xmlData = parser.parseFromString(tilesetData, 'application/xml');
        return xmlData.documentElement;
    }

    private static parseTilesetImage(element: Element | null, rootUrl: URL) : TilEdTilesetImage | undefined {
        if (element && element.tagName == 'image') {
            if (element) {
                const tilesetImage = new TilEdTilesetImage();
                tilesetImage.source = new URL(TilEdParser.parseStringAttribute(element, 'source'), rootUrl);
                tilesetImage.width = TilEdParser.parseNumberAttribute(element, 'width'); 
                tilesetImage.height = TilEdParser.parseNumberAttribute(element, 'height');

                return tilesetImage;
            }
        }

        return undefined;
    }

    private static parseTilesetTiles(tileElements: HTMLCollection, rootUrl: URL) : TilEdTilesetTile[] | undefined {
        const tiles: TilEdTilesetTile[] = [];
        for (let i = 0; i < tileElements.length; i++) {
            const tileElement = tileElements.item(i);
            if (tileElement) {
                const tile = new TilEdTilesetTile();
                tile.id = TilEdParser.parseNumberAttribute(tileElement, 'id');
                tile.image = TilEdParser.parseTilesetImage(tileElement.children.item(0), rootUrl) as TilEdTilesetImage; 

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
        layer.opacity = TilEdParser.parseNumberAttribute(layerElement, 'opacity', 1);
        layer.visible = TilEdParser.parseBooleanAttribute(layerElement, 'visible', true);
        layer.tintColor = TilEdParser.parseOptionalColor4Attribute(layerElement, 'tintColor');
        layer.offsetX = TilEdParser.parseNumberAttribute(layerElement, 'offsetx', 0);
        layer.offsetY = TilEdParser.parseNumberAttribute(layerElement, 'offsety', 0);

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

    private static parseBooleanAttribute(element: Element, name: string, valueIfMissing: boolean) : boolean {
        const number = TilEdParser.parseOptionalNumberAttribute(element, name);

        if (number === undefined) {
            return valueIfMissing;
        }

        if (number === 0) {
            return false;
        }

        return true;
    }

    private static parseOptionalNumberAttribute(element: Element, name: string) : number | undefined {
        let textValue = element.getAttribute(name);
        let numberValue = 0;

        if (!textValue) {
            return undefined;
        }

        numberValue = parseInt(textValue);

        if (Number.isNaN(numberValue)) {
            throw new Error(`Attribute ${name} in node ${element.nodeName} was not a number, but instead ${textValue}`);
        }

        return numberValue;
    }

    private static parseNumberAttribute(element: Element, name: string, valueIfMissing?: number) : number {
        let result = TilEdParser.parseOptionalNumberAttribute(element, name);

        if (result === undefined) {
            if (valueIfMissing === undefined) {
                throw new Error(`Attribute ${name} could not be found in node ${element.nodeName}`);
            } else {
                result = valueIfMissing;
            }
        }

        return result;
    }

    private static parseOptionalColor4Attribute(element: Element, name: string) : Color4 | undefined {
        let textValue = element.getAttribute(name);

        if (!textValue) {
            return undefined;
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