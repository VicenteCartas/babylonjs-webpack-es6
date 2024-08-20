import { RawTexture, Scene, Texture, Vector, Vector2 } from "@babylonjs/core";
import { TiledMap, TiledTileset } from "../tiled.types";
import { BaseSpriteMap } from "./baseSpriteMap";

// PARSING SHOULD READ THE TILES BUFFER DATA INTO MEMORY, SO WE DONT HAVE TO READ IT CONSTANTLY WHEN RENDERING THE MAP
// OR WE SHOULD CACHE HERE THE TILE BUFFERS INSTEAD? DICTIONARY<TILEID, TILEBUFFER>

export class OrthogonalSpriteMap extends BaseSpriteMap {
    constructor(map: TiledMap, scene: Scene) {
        super(map, scene);
    }

    public dispose() : void {
        this._mapTexture?.dispose();
        // DISPOSE ALL TEXTURES FROM THE TILED MAP
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

                        await this._changeTile(i, j, tileNumber);
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
            true,
            Texture.NEAREST_NEAREST_MIPNEAREST);
        this._mapTexture.hasAlpha = true;
        this._mapTexture.name = "spritemapTexture";
        
        return this._mapTexture;
    }

    /** Updates a position on the map texture */
    private async _changeTile(mapX: number, mapY: number, tileId: number) : Promise<void> {
        const mapXPx = mapX * this._map.tileWidth;
        const mapYPx = mapY * this._map.tileWidth;
        const tileHeightPx = this._map.tileHeight;
        const tileWidthPx = this._map.tileWidth;
        const mapWidthPx = this._mapPixelSize.x;

        // Get the tile data
        const tileset: TiledTileset = this._findTilesetForTile(tileId);
        const tilePosition = tileId - tileset.firstgid;
        const tileTextureData = await this._getTilesetTextureData(tileset, tilePosition);

        // Alpha blend the texture buffer data with the tile buffer data
        const offset = (mapXPx + mapYPx * mapWidthPx) * 4;
        for (let j = 0; j < tileHeightPx; j++) {
            for (let i = 0; i < tileWidthPx; i++) {
                const mapR = this._mapBuffer[offset + (i + mapWidthPx * j) * 4];
                const mapG = this._mapBuffer[offset + (i + mapWidthPx * j) * 4 + 1];
                const mapB = this._mapBuffer[offset + (i + mapWidthPx * j) * 4 + 2];
                const tileR = tileTextureData[(i + j * tileWidthPx) * 4];
                const tileG = tileTextureData[(i + j * tileWidthPx) * 4 + 1];
                const tileB = tileTextureData[(i + j * tileWidthPx) * 4 + 2];
                const alpha = tileTextureData[(i + j * tileWidthPx) * 4 + 3] / 255;
                
                this._mapBuffer[offset + (i + mapWidthPx * j) * 4] = mapR * (1 - alpha) + tileR * alpha;
                this._mapBuffer[offset + (i + mapWidthPx * j) * 4 + 1] = mapG * (1 - alpha) + tileG * alpha;
                this._mapBuffer[offset + (i + mapWidthPx * j) * 4 + 2] = mapB * (1 - alpha) + tileB * alpha;
                this._mapBuffer[offset + (i + mapWidthPx * j) * 4 + 3] = Math.max(this._mapBuffer[offset + (i + mapWidthPx * j) * 4 + 3], tileTextureData[(i + j * tileWidthPx) * 4 + 3]);
            }
        }
    }
}