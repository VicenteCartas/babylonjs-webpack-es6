import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ISpriteMap2, TiledMap } from "../tiled.types";

export class HexagonalPointTopSpriteMap implements ISpriteMap2 {
    private _map: TiledMap;
    private _scene: Scene;

    constructor(map: TiledMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
    }

    public getMapPixelSize(): Vector2 {
        if (this._map.hexSideLength) {
            return new Vector2(
                this._map.width * this._map.tileWidth + this._map.tileWidth / 2,
                Math.ceil(this._map.height / 2) * this._map.tileHeight + Math.floor(this._map.height / 2) * this._map.hexSideLength
            );
    
        }

        throw new Error('HexSideLenght not defined for hexagonal map');
    }

    public async renderToTexture() : Promise<Texture> {
        throw new Error('Not implemented');
    }

    public dispose() : void {
        // DISPOSE ALL TEXTURES FROM THE TILED MAP
    }
}