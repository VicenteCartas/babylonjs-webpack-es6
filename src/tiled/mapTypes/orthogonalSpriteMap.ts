import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdMap } from "../tilEd.types";

export class OrthogonalSpriteMap implements ITilEdSpriteMap {
    private _map: TilEdMap;
    private _scene: Scene;

    constructor(map: TilEdMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
    }

    public getMapPixelSize(): Vector2 {
        return new Vector2(
            this._map.width * this._map.tileWidth, 
            this._map.height * this._map.tileHeight);
    }
}