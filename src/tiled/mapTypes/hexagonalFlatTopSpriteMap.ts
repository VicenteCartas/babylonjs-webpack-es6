import { RawTexture, Scene, Texture, Vector2 } from "@babylonjs/core";
import { TiledMap, TiledTileset } from "../tiled.types";
import { BaseSpriteMap } from "./baseSpriteMap";

export class HexagonalFlatTopSpriteMap extends BaseSpriteMap {
    constructor(map: TiledMap, scene: Scene) {
        super(map, scene);
    }

    public dispose() : void {
        // DISPOSE ALL TEXTURES FROM THE TILED MAP
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
        let mapXPx = mapX * this._map.tileWidth;
        mapXPx -= mapX * (this._map.tileWidth - this._map.hexSideLength!) / 2;

        let mapYPx = mapY * this._map.tileWidth;
        const tileHeightPx = this._map.tileHeight;
        const tileWidthPx = this._map.tileWidth;
        const mapWidthPx = this._mapPixelSize.x;


        // TRANSFORM ODD/EVEN STRINGS TO 1/0 so it's just an IF
        if (mapX % 2 === 1 && this._map.staggerIndex === "odd") {
            mapY += 0.5;
            mapYPx = mapY * this._map.tileWidth;
        } else if (mapX % 2 === 0 && this._map.staggerIndex === "even") {
            mapY += 0.5;
            mapYPx = mapY * this._map.tileWidth;
        }

        // Get the tile data
        const tileset: TiledTileset = this._findTilesetForTile(tileId);
        const tilePosition = tileId - tileset.firstgid;
        const tileTextureData = await this._getTilesetTextureData(tileset, tilePosition);

        // Alpha blend the texture buffer data with the tile buffer data
        let offset = 0;
        if (mapX % 2 === 1) {
            offset = (mapXPx + mapYPx * mapWidthPx) * 4;
        } else {
            offset = (mapXPx + mapYPx * mapWidthPx) * 4;
        }

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