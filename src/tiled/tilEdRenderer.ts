import { RandomGUID, Scene, Sprite, SpriteMap, Texture, Vector2 } from "@babylonjs/core";
import { TilEdMap, TilEdTileset } from "./tilEd.types";
import { AtlasJson, AtlasJsonFrame } from "../types/atlasjson.types";

export class TilEdRenderer {
    public static DebugImageTileset(tileset: TilEdTileset, scene: Scene) : SpriteMap {
        // Create the JSON atlas to map from the TilEd tileset to the BabylonJS SpriteMap
        const atlasJson = TilEdRenderer.TilesetToAtlasJson(tileset, "1");

        // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
        const spriteSheet = new Texture(tileset.image!.source.toString(), scene,
            true,
            true,
            Texture.NEAREST_NEAREST_MIPNEAREST
        );
        spriteSheet.wrapU = Texture.CLAMP_ADDRESSMODE;
        spriteSheet.wrapV = Texture.CLAMP_ADDRESSMODE;

        // Size of the map
        const width = tileset.columns;
        const height = tileset.tileCount / tileset.columns;
        const backgroundSize = new Vector2(width * tileset.tileWidth, height * tileset.tileHeight);

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

    private static TilesetToAtlasJson(tileset: TilEdTileset, version: string): AtlasJson {
        const imageHeight = tileset.image!.height;
        const rows = tileset.image!.height / tileset.tileHeight;
        const columns = tileset.image!.width / tileset.tileWidth;
        const tileWidth = tileset.tileWidth;
        const tileHeight = tileset.tileHeight;
        
        let tileCount = 1;
        const atlasJsonFrames: AtlasJsonFrame[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++ ) {
                const frame: AtlasJsonFrame = {
                    filename: tileCount + ".png",
                    frame: { x: j * tileWidth, y: imageHeight - (i + 1) * tileHeight, w: tileWidth, h: tileHeight  },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: tileWidth, h: tileHeight },
                    sourceSize: { w: tileWidth, h: tileHeight }
                }
    
                atlasJsonFrames.push(frame);
                tileCount++;
            }
        }
    
        const atlasJson: AtlasJson = {
            frames: atlasJsonFrames,
            meta: {
                app: "https://www.mapeditor.org/",
                version: version,
                image: tileset.image!.source.toString(),
                format:"RGBA8888",
                size: {
                    w: tileset.image!.width,
                    h: tileset.image!.height
                },
                scale: 1,
                smartupdate: ""
            }
        }
    
        return atlasJson;
    }

    private static RenderOrthogonalMap(map: TilEdMap, scene: Scene) : SpriteMap {
        // Create the JSON atlas to map from the TilEd tileset to the BabylonJS SpriteMap
        const atlasJson = TilEdRenderer.TilesetToAtlasJson(map.tilesets[0], map.version);

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
}
