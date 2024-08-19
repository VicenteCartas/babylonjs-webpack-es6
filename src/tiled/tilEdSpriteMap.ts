import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { TilEdMap } from "./tilEd.types";

export class tilEdSpriteMap {
    private _map: TilEdMap;
    private _mapPixelSize: Vector2;
    private _scene: Scene;
    private _tilesTexture: RawTexture;

    constructor(map: TilEdMap, scene: Scene) {
        this._map = map;
        this._mapPixelSize = this._calculateMapPixelSize(map);
        this._scene = scene;
        this._tilesTexture = RawTexture.CreateRGBATexture(
            new Uint8Array(this._mapPixelSize.x * this._mapPixelSize.y * 4),
            this._mapPixelSize.x,
            this._mapPixelSize.y,
            this._scene,
            false,
            false,
            Texture.NEAREST_NEAREST,
            Engine.TEXTURETYPE_FLOAT);
    }

    private _calculateMapPixelSize(map: TilEdMap) : Vector2 {
        if (map.orientation === 'orthogonal') {
            return new Vector2(map.width * map.tileWidth, map.height * map.tileHeight);
        } else if (map.orientation === 'hexagonal') {
            if (map.staggerAxis === 'x') {
                return new Vector2(0, 0);
            } else {
                return new Vector2(0, 0);
            }
        } else if (map.orientation === 'isometric') {
            return new Vector2(0, 0);
        }

        throw new Error('Invalid map orientation');
    }
}