import { RandomGUID, RawTexture, Scene, Sprite, SpriteMap, Texture, Vector2 } from "@babylonjs/core";
import { TilEdMap, TilEdTileset } from "./tilEd.types";
import { AtlasJson, AtlasJsonFrame } from "../types/atlasjson.types";

export class TilEdRenderer {
    public static async DebugTileset(tileset: TilEdTileset, scene: Scene) : Promise<SpriteMap> {
        // Create the JSON atlas to map from the TilEd tileset to the BabylonJS SpriteMap
        const atlasJson = TilEdRenderer.TilesetToAtlasJson(tileset);

        // Get the texture from the image or images that form the tileset
        const spriteSheet = await TilEdRenderer.GetTilesetTexture(tileset, scene);

        // Size of the tileset
        const width = tileset.columns;
        const height = tileset.tileCount / tileset.columns;
        const backgroundSize = new Vector2(width, height);

        // Create the sprite map
        const spriteMap = new SpriteMap(
            'TilEdMap' + RandomGUID(),
            atlasJson,
            spriteSheet,
            {
                stageSize: backgroundSize,
                layerCount: 1
            },
            scene
        );

        // Render the tiles
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                spriteMap.changeTiles(0, new Vector2(i, height - j - 1), j * width + i);
            }
        }

        return spriteMap;
    }

    public static RenderTilemap(map: TilEdMap, scene: Scene): SpriteMap | undefined {
        if (map.orientation == "orthogonal") {
            return TilEdRenderer.RenderOrthogonalMap(map, scene);
        }

        return undefined;
    }

    private static RenderOrthogonalMap(map: TilEdMap, scene: Scene) : SpriteMap {
        // Create the JSON atlas to map from the TilEd tileset to the BabylonJS SpriteMap
        const atlasJson = TilEdRenderer.TilesetToAtlasJson(map.tilesets[0]);

        // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
        const spriteSheet = new Texture(map.tilesets[0].image!.source.toString(), scene,
            true,
            true,
            Texture.NEAREST_NEAREST_MIPNEAREST
        );
        spriteSheet.wrapU = Texture.CLAMP_ADDRESSMODE;
        spriteSheet.wrapV = Texture.CLAMP_ADDRESSMODE;

        // Size of the map
        const width = map.width;
        const height = map.height;
        const backgroundSize = new Vector2(width, height);

        // Create the sprite map
        const spriteMap = new SpriteMap(
            'TilEdMap' + RandomGUID(),
            atlasJson,
            spriteSheet,
            {
                stageSize: backgroundSize,
                layerCount: map.layers.length,
            },
            scene
        );

        // Last tile is transparent
        const lastTile = map.tilesets[0].tileCount - 1;

        // Update the SpriteMap with the data from the TilEd map
        for (let z = 0; z < map.layers.length; z++) {
            if (map.layers[z].visible) {
                for (let j = 0; j < height; j++) {
                    for (let i = 0; i < width; i++) {
                        const tileNumber = map.layers[z].data[i + j * width];
    
                        // TilEd uses 0 for empty tiles, which we will replace by a transparent tile as layers are opaque in SpriteMap
                        // TilEd tiles are 1-indexed, while AtlasJSON uses 0-index for frames
                        if (tileNumber > 0) {
                            spriteMap.changeTiles(z, new Vector2(i, height - j - 1), tileNumber - 1);
                        } else {
                            spriteMap.changeTiles(z, new Vector2(i, height - j - 1), lastTile); // Transparent tile
                        }
                    }
                }
            }
        }

        return spriteMap;
    }

    private static TilesetToAtlasJson(tileset: TilEdTileset) : AtlasJson {
        if (tileset.image !== undefined) {
            return TilEdRenderer.ImageTilesetToAtlasJson(tileset);
        } else if (tileset.tiles !== undefined && tileset.tiles.length > 0) {
            return TilEdRenderer.TilesTilesetToAtlasJson(tileset);
        }

        throw new Error(`Invalid tileset: ${tileset.name}`);
    }

    private static ImageTilesetToAtlasJson(tileset: TilEdTileset): AtlasJson {
        const image = tileset.image!;
        const rows = image.height / tileset.tileHeight;
        const columns = image.width / tileset.tileWidth;
        
        let tileCount = 1;
        const atlasJsonFrames: AtlasJsonFrame[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++ ) {
                const frame: AtlasJsonFrame = {
                    filename: tileCount + ".png",
                    frame: { x: j * tileset.tileWidth, y: image.height - (i + 1) * tileset.tileHeight, w: tileset.tileWidth, h: tileset.tileHeight  },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: tileset.tileWidth, h: tileset.tileHeight },
                    sourceSize: { w: tileset.tileWidth, h: tileset.tileHeight }
                }
    
                atlasJsonFrames.push(frame);
                tileCount++;
            }
        }
    
        const atlasJson: AtlasJson = {
            frames: atlasJsonFrames,
            meta: {
                app: "https://www.mapeditor.org/",
                version: "1",
                image: image.source.toString(),
                format:"RGBA8888",
                size: {
                    w: image.width,
                    h: image.height
                },
                scale: 1,
                smartupdate: ""
            }
        }
    
        return atlasJson;
    }

    private static TilesTilesetToAtlasJson(tileset: TilEdTileset): AtlasJson {
        const tiles = tileset.tiles!;
        const atlasJsonFrames: AtlasJsonFrame[] = [];
        for (let i = 0; i < tiles.length; i++) {
            const imageName = tiles[i].image.source.toString();
            const frame: AtlasJsonFrame = {
                filename: imageName.slice(imageName.lastIndexOf('/')),
                frame: { x: i * tileset.tileWidth, y: 0, w: tileset.tileWidth, h: tileset.tileHeight  },
                rotated: false,
                trimmed: false,
                spriteSourceSize: { x: 0, y: 0, w: tileset.tileWidth, h: tileset.tileHeight },
                sourceSize: { w: tileset.tileWidth, h: tileset.tileHeight }
            };

            atlasJsonFrames.push(frame);
        }
    
        const atlasJson: AtlasJson = {
            frames: atlasJsonFrames,
            meta: {
                app: "https://www.mapeditor.org/",
                version: "1",
                image: RandomGUID() + ".png",
                format:"RGBA8888",
                size: {
                    w: tiles.length * tileset.tileWidth,
                    h: tileset.tileHeight
                },
                scale: 1,
                smartupdate: ""
            }
        }

        return atlasJson;
    }

    private static async GetTilesetTexture(tileset: TilEdTileset, scene: Scene) : Promise<Texture> {
        if (tileset.image !== undefined) {
            return TilEdRenderer.GetImageTilesetTexture(tileset, scene);
        } else if (tileset.tiles !== undefined && tileset.tiles.length > 0) {
            return TilEdRenderer.GetTilesTilesetTexture(tileset, scene);
        }

        throw new Error(`Invalid tileset: ${tileset.name}`);
    }

    private static async GetImageTilesetTexture(tileset: TilEdTileset, scene: Scene) : Promise<Texture> {
        // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
        const spriteSheet = new Texture(
            tileset.image!.source.toString(),
            scene,
            true,
            true,
            Texture.NEAREST_NEAREST_MIPNEAREST
        );
        spriteSheet.wrapU = Texture.CLAMP_ADDRESSMODE;
        spriteSheet.wrapV = Texture.CLAMP_ADDRESSMODE;

        return Promise.resolve(spriteSheet);
    }

    private static async GetTilesTilesetTexture(tileset: TilEdTileset, scene: Scene) : Promise<Texture> {
        tileset.columns = tileset.tiles!.length;
        const textures: Texture[] = [];
        const texturesData: Uint8Array[] = [];

        // Load all textures
        for (let i = 0; i < tileset.tiles!.length; i++) {
            const tile = tileset.tiles![i];
            const texture = new Texture(
                tile.image.source.toString(),
                scene,
                true,
                true,
                Texture.NEAREST_NEAREST_MIPNEAREST);
            texture.wrapU = Texture.CLAMP_ADDRESSMODE;
            texture.wrapV = Texture.CLAMP_ADDRESSMODE;
            textures.push(texture);
        }

        await TilEdRenderer.LoadTextures(textures);

        // Read all textures data
        for (let i = 0; i < tileset.tiles!.length; i++) {
            const texture = textures[i];
            const pixels = await texture.readPixels()!;
            texturesData.push(new Uint8Array(pixels.buffer));
            texture.dispose();
        }

        // Combine all textures data into a single texture
        return RawTexture.CreateRGBTexture(
            TilEdRenderer.MergeArrays(texturesData),
            tileset.tileWidth * tileset.tileCount,
            tileset.tileHeight,
            scene);
    }

    private static async LoadTextures(textures: Texture[]) : Promise<void> {
        return new Promise((resolve, reject) => {
            Texture.WhenAllReady(textures, resolve);
        });
    }

    private static MergeArrays(arrays: Uint8Array[]) : Uint8Array {
        // Get the total length of all arrays.
        let length = 0;
        arrays.forEach(array => {
            length += array.length;
        });

        // Create a new array with total length and merge all source arrays.
        let mergedArray = new Uint8Array(length);
        let offset = 0;
        arrays.forEach(item => {
            mergedArray.set(item, offset);
            offset += item.length;
    	});

        return mergedArray;
    }
}