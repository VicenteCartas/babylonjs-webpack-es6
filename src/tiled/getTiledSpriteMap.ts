import { Scene } from "@babylonjs/core";
import { ITilEdSpriteMap, TilEdMap } from "./tilEd.types";
import { OrthogonalSpriteMap } from "./mapTypes/orthogonalSpriteMap";
import { IsometricSpriteMap } from "./mapTypes/isometricSpriteMap";
import { HexagonalPointTopSpriteMap } from "./mapTypes/hexagonalPointTopSpriteMap";
import { HexagonalFlatTopSpriteMap } from "./mapTypes/hexagonalFlatTopSpriteMap";

export function getTiledSpriteMap(map: TilEdMap, scene: Scene) : ITilEdSpriteMap {
    switch (map.orientation) {
        case 'orthogonal': {
            return new OrthogonalSpriteMap(map, scene);
        }

        case 'hexagonal': {
            if (map.staggerAxis === 'x') {
                return new HexagonalFlatTopSpriteMap(map, scene);
            } else if (map.staggerAxis === 'y') {
                return new HexagonalPointTopSpriteMap(map, scene);
            } else {
                throw new Error('Invalid staggerAxis for hexagonal map');
            }
        }

        case 'isometric': {
            return new IsometricSpriteMap(map, scene);
        }

        default: {
            throw new Error('Non supported map type');
        }
    }
}