import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdMap } from "../tilEd.types";

export class HexagonalFlatTopSpriteMap implements ITilEdSpriteMap {
    private _map: TilEdMap;
    private _scene: Scene;

    constructor(map: TilEdMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
    }

    public getMapPixelSize(): Vector2 {
        if (this._map.hexSideLength) {
            return new Vector2(
                Math.ceil(this._map.width / 2) * this._map.tileWidth + Math.floor(this._map.width / 2) * this._map.hexSideLength,
                this._map.height * this._map.tileHeight + this._map.tileHeight / 2);
    
        }

        throw new Error('HexSideLenght not defined for hexagonal map');
    }

    public async renderToTexture() : Promise<Texture> {
        throw new Error('Not implemented');
    }
}