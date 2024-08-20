import { Color4, Scene, Texture } from "@babylonjs/core";
import {
    TiledLayer,
    TiledLayerEncoding,
    TiledMap,
    TiledMapOrientation,
    TiledMapRenderOrder,
    TiledMapStaggerAxis,
    TiledMapStaggerIndex,
    TiledTileset,
    TiledTilesetTile
} from "./tiled.types";
import { FileUtilities } from "./fileUtilities";

export class TiledParser {
    private texturesToLoad: Texture[] = [];

    constructor() {}

    public async parseMapData(mapData: string, rootUrl: URL, scene: Scene) : Promise<TiledMap> {
        this.dispose();
        this.texturesToLoad = [];

        // https://gist.github.com/prof3ssorSt3v3/61ccf69758cd6dbdc429934564864650
        let parser = new DOMParser();
        let xmlData = parser.parseFromString(mapData, 'application/xml');
        let mapNode = xmlData.documentElement;
        
        const map = new TiledMap();

        // Parse the map data
        map.version = TiledParser.parseStringAttribute(mapNode, 'version');
        map.tiledVersion = TiledParser.parseStringAttribute(mapNode, 'tiledversion');
        map.orientation = TiledParser.parseStringAttribute(mapNode, 'orientation') as TiledMapOrientation;
        map.renderorder = TiledParser.parseStringAttribute(mapNode, 'renderorder') as TiledMapRenderOrder;
        map.width = TiledParser.parseNumberAttribute(mapNode, 'width');
        map.height = TiledParser.parseNumberAttribute(mapNode, 'height');
        map.tileWidth = TiledParser.parseNumberAttribute(mapNode, 'tilewidth');
        map.tileHeight = TiledParser.parseNumberAttribute(mapNode, 'tileheight');
        map.hexSideLength = TiledParser.parseOptionalNumberAttribute(mapNode, 'hexsidelength');
        map.staggerAxis = mapNode.getAttribute('staggeraxis') as TiledMapStaggerAxis;
        map.staggerIndex = mapNode.getAttribute('staggerindex') as TiledMapStaggerIndex;

        // Parse all tilesets
        map.tilesets = await this.parseTilesets(mapNode, rootUrl, scene);

        // Parse all layers
        map.layers = this.parseLayers(mapNode);
        
        // Finish loading all textures
        await TiledParser.loadTextures(this.texturesToLoad);
        
        return map;
    }

    public dispose() : void {
        this.texturesToLoad.forEach(texture => {
            texture.dispose();
        });
    }

    private async parseTilesets(mapElement: HTMLElement, rootUrl: URL, scene: Scene) : Promise<TiledTileset[]> {
        const tilesets: TiledTileset[] = [];
        const tilesetElements = mapElement.getElementsByTagName('tileset');

        if (tilesetElements) {
            for (let i = 0; i < tilesetElements.length; i++) {
                const tilesetElement = tilesetElements.item(i);
                if (tilesetElement) {
                    tilesets.push(await this.parseTileset(tilesetElement, rootUrl, scene));
                }
            }
        }

        return tilesets;
    }

    private async parseTileset(tilesetElement: Element, rootUrl: URL, scene: Scene): Promise<TiledTileset> {
        const tileset = new TiledTileset();
        tileset.firstgid = TiledParser.parseNumberAttribute(tilesetElement, 'firstgid');

        // Test if tileset is local or not
        const source = tilesetElement.getAttribute('source');
        if (source) {
            tilesetElement = await this.parseRemoteTileset(source, rootUrl);
        }

        tileset.name = TiledParser.parseStringAttribute(tilesetElement, 'name');
        tileset.tileWidth = TiledParser.parseNumberAttribute(tilesetElement, 'tilewidth');
        tileset.tileHeight = TiledParser.parseNumberAttribute(tilesetElement, 'tileheight');
        tileset.spacing = TiledParser.parseNumberAttribute(tilesetElement, 'spacing', 0);
        tileset.margin = TiledParser.parseNumberAttribute(tilesetElement, 'margin', 0);
        tileset.tileCount = TiledParser.parseNumberAttribute(tilesetElement, 'tilecount');
        tileset.columns = TiledParser.parseNumberAttribute(tilesetElement, 'columns');
        tileset.image = this.parseTilesetImage(tilesetElement.children.item(0), rootUrl, scene);
        tileset.tiles = this.parseTilesetTiles(tilesetElement.getElementsByTagName('tile'), rootUrl, scene);

        return tileset;
    }
 
    private async parseRemoteTileset(tilesetUrl: string, rootUrl: URL) : Promise<Element>{
        const tilesetData = await FileUtilities.requestFile(new URL(tilesetUrl, rootUrl));
        let parser = new DOMParser();
        let xmlData = parser.parseFromString(tilesetData, 'application/xml');
        return xmlData.documentElement;
    }

    private parseTilesetImage(element: Element | null, rootUrl: URL, scene: Scene) : Texture | undefined {
        if (element && element.tagName == 'image') {
            if (element) {
                const texture = new Texture(
                    new URL(TiledParser.parseStringAttribute(element, 'source'), rootUrl).toString(),
                    scene,
                    true,
                    false,
                    Texture.NEAREST_NEAREST_MIPNEAREST
                );

                this.texturesToLoad.push(texture);
                return texture;
            }
        }

        return undefined;
    }

    private parseTilesetTiles(tileElements: HTMLCollection, rootUrl: URL, scene: Scene) : TiledTilesetTile[] | undefined {
        const tiles: TiledTilesetTile[] = [];
        for (let i = 0; i < tileElements.length; i++) {
            const tileElement = tileElements.item(i);
            if (tileElement) {
                const tile = new TiledTilesetTile();
                tile.id = TiledParser.parseNumberAttribute(tileElement, 'id');
                tile.image = this.parseTilesetImage(tileElement.children.item(0), rootUrl, scene); 

                tiles.push(tile);
            }
        }

        if (tiles.length === 0) {
            return undefined;
        }

        return tiles;
    }

    private parseLayers(mapElement: HTMLElement): TiledLayer[] {
        const layers: TiledLayer[] = [];
        const layerElements = mapElement.getElementsByTagName('layer');

        if (layerElements) {
            for (let i = 0; i < layerElements.length; i++) {
                const layerElement = layerElements.item(i);
                if (layerElement) {
                    layers.push(this.parseLayer(layerElement));
                }
            }
        }

        return layers;
    }
    
    private parseLayer(layerElement: Element): TiledLayer {
        const layer: TiledLayer = new TiledLayer();

        // Parse the layer data
        layer.name = TiledParser.parseStringAttribute(layerElement, 'name');
        layer.width = TiledParser.parseNumberAttribute(layerElement, 'width');
        layer.height = TiledParser.parseNumberAttribute(layerElement, 'height');
        layer.opacity = TiledParser.parseNumberAttribute(layerElement, 'opacity', 1);
        layer.visible = TiledParser.parseBooleanAttribute(layerElement, 'visible', true);
        layer.tintColor = TiledParser.parseOptionalColor4Attribute(layerElement, 'tintColor');
        layer.offsetX = TiledParser.parseNumberAttribute(layerElement, 'offsetx', 0);
        layer.offsetY = TiledParser.parseNumberAttribute(layerElement, 'offsety', 0);

        // Read the layer data
        const dataElement = layerElement.getElementsByTagName('data').item(0);
        if (dataElement) {
            layer.encoding = TiledParser.parseStringAttribute(dataElement, 'encoding') as TiledLayerEncoding;
            layer.data = this.parseLayerData(dataElement, layer.encoding);
        }

        return layer;
    }

    private parseLayerData(dataElement: Element, encoding: TiledLayerEncoding): number[] {
        if (encoding === 'csv') {
            return this.parseCsvLayerData(dataElement.textContent);
        } else if (encoding == 'base64') {
            return this.parseBase64LayerData(dataElement.textContent);
        } else {
            throw new Error('Unknown encoding ' + encoding + ' in node ' + dataElement.tagName);
        }
    }

    private parseCsvLayerData(data: string | null) : number[] {
        if (!data) {
            return [];
        }

        const split = data.replaceAll('\r\n', '').split(',');
        return split.map((value: string) => { 
            return parseInt(value);
        });
    }

    private parseBase64LayerData(data: string | null) : number[] {
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
        const number = TiledParser.parseOptionalNumberAttribute(element, name);

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
        let result = TiledParser.parseOptionalNumberAttribute(element, name);

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

    private static async loadTextures(textures: Texture[]) : Promise<void> {
        return new Promise((resolve, reject) => {
            Texture.WhenAllReady(textures, resolve);
        });
    }
}