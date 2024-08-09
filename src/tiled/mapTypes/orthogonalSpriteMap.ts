import { Engine, RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdLayer, TilEdMap, TilEdTileset } from "../tilEd.types";

// PARSING SHOULD READ THE TILES BUFFER DATA INTO MEMORY, SO WE DONT HAVE TO READ IT CONSTANTLY WHEN RENDERING THE MAP
// OR WE SHOULD CACHE HERE THE TILE BUFFERS INSTEAD? DICTIONARY<TILEID, TILEBUFFER>

export class OrthogonalSpriteMap implements ITilEdSpriteMap {
    private _map: TilEdMap;
    private _scene: Scene;
    private _mapPixelSize: Vector2;
    private _mapTexture: Texture | undefined;

    /** Auxiliar buffer to load tiles data when rendering the map */
    private _tileBuffer: Uint8Array;

    /** Buffer where we paint the map */
    private _mapBuffer: Uint8Array;

    constructor(map: TilEdMap, scene: Scene) {
        this._map = map;
        this._scene = scene;
        this._mapPixelSize = this.getMapPixelSize();
        this._tileBuffer = new Uint8Array(this._map.tileWidth * this._map.tileHeight * 4);
        this._mapBuffer = new Uint8Array(this._mapPixelSize.x * this._mapPixelSize.y * 4)
    }

    public getMapPixelSize(): Vector2 {
        return new Vector2(
            this._map.width * this._map.tileWidth, 
            this._map.height * this._map.tileHeight);
    }

    public async renderToTexture() : Promise<Texture> {
        const height = this._map.height;
        const width = this._map.width;

        for (let z = 0; z < this._map.layers.length; z++) {
            if (this._map.layers[z].visible) {
                for (let j = 0; j < height; j++) {
                    for (let i = 0; i < width; i++) {
                        const tileNumber = this._map.layers[z].data[i + j * width];
                        // TilEd uses 0 to represent no tile present
                        if (tileNumber === 0) {
                            continue;
                        }

                        await this._changeTile(new Vector2(i, height - j - 1), z, tileNumber);
                    }
                }
            }
        }

        this._mapTexture?.dispose();
        this._mapTexture = RawTexture.CreateRGBATexture(
            this._mapBuffer,
            this._mapPixelSize.x,
            this._mapPixelSize.y,
            this._scene,
            false,
            false,
            Texture.NEAREST_NEAREST,
            Engine.TEXTURETYPE_FLOAT);

        return this._mapTexture;
    }

    public dispose() : void {
        this._mapTexture?.dispose();
        // DISPOSE ALL TEXTURES FROM THE TILED MAP
    }

    /** Updates a position on the map texture */
    private async _changeTile(mapPosition: Vector2, layerIndex: number, tileId: number) : Promise<void> {
        const tileHeight = this._map.tileHeight;
        const tileWidth = this._map.tileWidth;
        const mapHeight = this._mapPixelSize.y;
        const mapWidth = this._mapPixelSize.x;

        // Get the tile data
        const tileset: TilEdTileset = this._findTilesetForTile(tileId);
        const tilePosition = tileId - tileset.firstgid;
        const tileTextureData = await this._getTilesetTextureData(tileset, tilePosition);

        // Update the texture buffer with the tile buffer data
        for (let j = 0; j < tileHeight; j++) {
            for (let i = 0; i < tileWidth; i++) {
                this._mapBuffer[mapWidth * 4 * mapPosition.y * tileHeight * 4 + mapPosition.x * tileWidth * 4] = tileTextureData[j * tileWidth + i];
                this._mapBuffer[mapWidth * 4 * mapPosition.y * tileHeight * 4 + mapPosition.x * tileWidth * 4 + 1] = tileTextureData[j * tileWidth + i + 1];
                this._mapBuffer[mapWidth * 4 * mapPosition.y * tileHeight * 4 + mapPosition.x * tileWidth * 4 + 2] = tileTextureData[j * tileWidth + i + 2];
                this._mapBuffer[mapWidth * 4 * mapPosition.y * tileHeight * 4 + mapPosition.x * tileWidth * 4 + 3] = tileTextureData[j * tileWidth + i + 3];
            }
        }
    }

    /** Finds the tileset that this tile id depends on so we know which texture to use to render the tile*/
    private _findTilesetForTile(tileId: number) : TilEdTileset {
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
    private _getTilesetTextureData(tileset: TilEdTileset, tileId: number) : Promise<Uint8Array> {
        if (tileset.image !== undefined) {
            return this._getSingleImageTilesetTileData(tileset, tileId);
        } else if (tileset.tiles !== undefined && tileset.tiles.length > 0) {
            return this._getMultipleImagesTilesetTileData(tileset, tileId);
        } else {
            throw new Error(`Invalid tileset: ${tileset.name}`);
        }
    }

    private async _getSingleImageTilesetTileData(tileset: TilEdTileset, tileId: number) : Promise<Uint8Array> {
        await tileset.image!.readPixels(
            undefined,
            undefined,
            this._tileBuffer,
            false,
            false,
            0,
            0,
            this._map.tileWidth,
            this._map.tileHeight);
        return this._tileBuffer;
    }

    private async _getMultipleImagesTilesetTileData(tileset: TilEdTileset, tileId: number) : Promise<Uint8Array> {
        await tileset.tiles![tileId].image!.readPixels(0, 0, this._tileBuffer);
        return this._tileBuffer;
    }
}