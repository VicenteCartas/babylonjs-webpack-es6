import { Mesh, MeshBuilder, Scene, StandardMaterial, Vector4 } from "@babylonjs/core";
import { ISpriteMap2 } from "./tiled.types";
import { OrthogonalSpriteMap } from "./mapTypes/orthogonalSpriteMap";
import { IsometricSpriteMap } from "./mapTypes/isometricSpriteMap";
import { HexagonalPointTopSpriteMap } from "./mapTypes/hexagonalPointTopSpriteMap";
import { HexagonalFlatTopSpriteMap } from "./mapTypes/hexagonalFlatTopSpriteMap";
import { FileUtilities } from "./fileUtilities";
import { TiledParser } from "./tiledParser";

export async function loadSpriteMap(rootUrl: string, scene: Scene) : Promise<ISpriteMap2> {
    const url = new URL(rootUrl);
    const mapData = await FileUtilities.requestFile(url);
    const parser = new TiledParser();
    const map = await parser.parseMapData(mapData, url, scene);

    let spriteMap: ISpriteMap2;

    switch (map.orientation) {
        case 'orthogonal': {
            spriteMap = new OrthogonalSpriteMap(map, scene);
            break;
        }

        case 'hexagonal': {
            if (map.staggerAxis === 'x') {
                spriteMap = new HexagonalFlatTopSpriteMap(map, scene);
                break;
            } else if (map.staggerAxis === 'y') {
                spriteMap = new HexagonalPointTopSpriteMap(map, scene);
                break;
            } else {
                throw new Error('Invalid staggerAxis for hexagonal map');
            }
        }

        case 'isometric': {
            spriteMap = new IsometricSpriteMap(map, scene);
            break;
        }

        default: {
            throw new Error('Non supported map type');
        }
    }

    const size = spriteMap.getMapPixelSize();
    const mapTexture = await spriteMap.renderToTexture();

    const f = new Vector4(0, 0, 1, 1);
    const plane = MeshBuilder.CreatePlane("plane", { width: size.x, height: size.y, frontUVs: f, sideOrientation: Mesh.FRONTSIDE}, scene);
    const material = new StandardMaterial("Material", scene);
    material.diffuseTexture = mapTexture;
    material.useAlphaFromDiffuseTexture = true;
    plane.material = material;

    return spriteMap;
}