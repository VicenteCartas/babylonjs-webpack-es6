import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdMap } from "./tilEd.types";
import { OrthogonalSpriteMap } from "./mapTypes/orthogonalSpriteMap";

export class tilEdSpriteMap implements ITilEdSpriteMap {
    private _internalSpriteMap: ITilEdSpriteMap;
    private _map: TilEdMap;
    private _mapPixelSize: Vector2;
    private _scene: Scene;
    private _mapTexture: RawTexture;

    constructor(map: TilEdMap, scene: Scene) {
        this._internalSpriteMap = this._createSpriteMap(map, scene);
        this._map = map;
        this._mapPixelSize = this._calculateMapPixelSize(map);
        this._scene = scene;
        this._mapTexture = RawTexture.CreateRGBATexture(
            new Uint8Array(this._mapPixelSize.x * this._mapPixelSize.y * 4),
            this._mapPixelSize.x,
            this._mapPixelSize.y,
            this._scene,
            false,
            false,
            Texture.NEAREST_NEAREST,
            Engine.TEXTURETYPE_FLOAT);
        
        this._updateMapTexture(this._map, this._mapTexture);
    }
    
    public getMapPixelSize(): Vector2 {
        return this._internalSpriteMap.getMapPixelSize();
    }

    private _createSpriteMap(map: TilEdMap, scene: Scene) : ITilEdSpriteMap {
        switch (map.orientation) {
            case 'orthogonal': {
                return new OrthogonalSpriteMap(map, scene);
            }

            case 'hexagonal': {
                throw new Error('Non supported map type');
            }

            case 'isometric': {
                throw new Error('Non supported map type');
            }
            default: {
                throw new Error('Non supported map type');
            }
        }
    }

    private _calculateMapPixelSize(map: TilEdMap) : Vector2 {
        if (map.orientation === 'orthogonal') {
            return new Vector2(map.width * map.tileWidth, map.height * map.tileHeight);
        } else if (map.orientation === 'hexagonal') {
            return this._calculateHexMapBoundingBox(map);
        } else if (map.orientation === 'isometric') {
            throw new Error('Not implemented');
        }

        throw new Error('Invalid map orientation');
    }

    private _calculateHexMapBoundingBox(map: TilEdMap) {
        if (map.hexSideLength) {
            if (map.staggerAxis === 'x') {
                return new Vector2(
                    Math.ceil(map.width / 2) * map.tileWidth + Math.floor(map.width / 2) * map.hexSideLength,
                    map.height * map.tileHeight + map.tileHeight / 2);
            } else {
                return new Vector2(
                    map.width * map.tileWidth + map.tileWidth / 2,
                    Math.ceil(map.height / 2) * map.tileHeight + Math.floor(map.height / 2) * map.hexSideLength,
                    );
            }
        } else {
            throw new Error('Hexagonal map requires hexSideLength to be defined');
        }
    }

    // Renders the TilEd map into the raw texture
    private _updateMapTexture(map: TilEdMap, tilesTexture: RawTexture) {
        switch (map.orientation) {
            case 'orthogonal': {
                break;
            }

            case 'hexagonal': {
                break;
            }

            case 'isometric': {
                break;
            }
            default: {
                throw new Error('Non supported map type');
            }
        }
    }
}