import {
    TilEdLayer,
    TilEdLayerEncoding,
    TilEdMap,
    TilEdMapOrientation,
    TilEdMapRenderOrder,
    TilEdMapStaggerAxis,
    TilEdMapStaggerIndex
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

        // Parse all layers
        map.layers = this.parseLayers(mapNode);
        
        return map;
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
        //layer.tintColor = TilEdParser.parseColor4Attribute(layerElement, 'visible');
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

    private static parseStringAttribute(element: Element, name: string) : string {
        let textValue = element.getAttribute(name);

        if (!textValue) {
            throw new Error('Error parsing attribute ' + name + ' from node: ' + element.nodeName);
        }

        return textValue;
    }
}