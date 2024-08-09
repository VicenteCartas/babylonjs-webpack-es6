import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdMap } from "../tilEd.types";

export class HexagonalPointTopSpriteMap implements ITilEdSpriteMap {
    private _map: TilEdMap;
    private _scene: Scene;

    constructor(map: TilEdMap, scene: Scene) {
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
}