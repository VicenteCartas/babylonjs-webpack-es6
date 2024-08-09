import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdMap } from "../tilEd.types";

export class IsometricSpriteMap implements ITilEdSpriteMap {
    private _map: TilEdMap;
    private _scene: Scene;

    constructor(map: TilEdMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
    }

    public getMapPixelSize(): Vector2 {
        throw new Error('Not implemented');
    }

    public async renderToTexture() : Promise<Texture> {
        throw new Error('Not implemented');
    }
}