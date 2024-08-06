import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { TilEdMap } from "./tilEd.types";

export class tilEdSpriteMap {
    private _map: TilEdMap;
    private _mapPixelSize: Vector2;
    private _scene: Scene;
    private _mapTexture: RawTexture;

    constructor(map: TilEdMap, scene: Scene) {
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

    private _calculateMapPixelSize(map: TilEdMap) : Vector2 {
        if (map.orientation === 'orthogonal') {
            return new Vector2(map.width * map.tileWidth, map.height * map.tileHeight);
        } else if (map.orientation === 'hexagonal' && map.hexSideLength) {
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
        } else if (map.orientation === 'isometric') {
            throw new Error('Not implemented');
        }

        throw new Error('Invalid map orientation');
    }

    // Renders the TilEd map into the raw texture
    private _updateMapTexture(map: TilEdMap, tilesTexture: RawTexture) {
        
    }
}