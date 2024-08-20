import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ISpriteMap2, TiledMap } from "../tiled.types";

export class IsometricSpriteMap implements ISpriteMap2 {
    private _map: TiledMap;
    private _scene: Scene;

    constructor(map: TiledMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
    }

    public getMapPixelSize(): Vector2 {
        throw new Error('Not implemented');
    }

    public async renderToTexture() : Promise<Texture> {
        throw new Error('Not implemented');
    }

    public dispose() : void {
        // DISPOSE ALL TEXTURES FROM THE TILED MAP
    }
}