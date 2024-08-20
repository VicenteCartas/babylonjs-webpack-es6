import { Vector2, Texture, Scene } from "@babylonjs/core";
import { ISpriteMap2, TiledMap, TiledTileset } from "../tiled.types";

export abstract class BaseSpriteMap implements ISpriteMap2 {
    protected _map: TiledMap;
    protected _scene: Scene;
    protected _mapPixelSize: Vector2;
    protected _mapTexture: Texture | undefined;

    /** Buffer where we paint the map */
    protected _mapBuffer: Uint8Array;

     /** Auxiliar buffer to load tiles data when rendering the map */
     private _tileBuffer: Uint8Array;

    constructor(map: TiledMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
        this._mapPixelSize = this.getMapPixelSize();
        this._mapBuffer = new Uint8Array(this._mapPixelSize.x * this._mapPixelSize.y * 4);
        this._tileBuffer = new Uint8Array(this._map.tileWidth * this._map.tileHeight * 4);
    }

    public abstract dispose(): void ;
    public abstract getMapPixelSize(): Vector2;
    public abstract renderToTexture(): Promise<Texture>;

    /** Finds the tileset that this tile id depends on so we know which texture to use to render the tile */
    protected _findTilesetForTile(tileId: number) : TiledTileset {
        const tileSet = this._map.tilesets[0];
        for (let i = 0; i < this._map.tilesets.length - 1; i++) {
            if (this._map.tilesets[i].firstgid < tileId &&
                this._map.tilesets[i].firstgid > tileId) {
                return this._map.tilesets[i];
            }
        }

        return tileSet;
    }

    /** Gets the tile pixel data */
    protected _getTilesetTextureData(tileset: TiledTileset, tileId: number) : Promise<Uint8Array> {
        if (tileset.image !== undefined) {
            return this._getSingleImageTilesetTileData(tileset, tileId);
        } else if (tileset.tiles !== undefined && tileset.tiles.length > 0) {
            return this._getMultipleImagesTilesetTileData(tileset, tileId);
        } else {
            throw new Error(`Invalid tileset: ${tileset.name}`);
        }
    }

    private async _getSingleImageTilesetTileData(tileset: TiledTileset, tileId: number) : Promise<Uint8Array> {
        await tileset.image!.readPixels(
            undefined,
            undefined,
            this._tileBuffer,
            false,
            false,
            tileId % tileset.columns * this._map.tileWidth,
            Math.floor(tileId / tileset.columns) * this._map.tileHeight,
            this._map.tileWidth,
            this._map.tileHeight);

        return this._tileBuffer;
    }

    private async _getMultipleImagesTilesetTileData(tileset: TiledTileset, tileId: number) : Promise<Uint8Array> {
        await tileset.tiles![tileId].image!.readPixels(0, 0, this._tileBuffer);
        return this._tileBuffer;
    }
}