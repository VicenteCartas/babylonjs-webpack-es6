import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color4 } from "@babylonjs/core";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { CreateSceneClass } from "../createScene";
import { TilEdImporter } from "../tiled/tilEdImporter";

// digital assets

// maps
import cityTilEdMap from "../../assets/cityMap.tmx";
import worldTilEdMap from "../../assets/worldMap.tmx";
import hexagonalMap from "../../assets/HexagonalMap.tmx";

// tilesets
import hexagonalTileSet from "../../assets/HexagonalTileset.tmx";

// images
import cityTiles from "../../assets/cityTiles.png";
import worldTiles from "../../assets/worldTiles.png";
import city1 from "../../assets/TestTiles/City1.png";
import city2 from "../../assets/TestTiles/City2.png";
import city3 from "../../assets/TestTiles/City3.png";
import city4 from "../../assets/TestTiles/City4.png";
import city5 from "../../assets/TestTiles/City5.png";
import grass1 from "../../assets/TestTiles/Grass1.png";
import grass2 from "../../assets/TestTiles/Grass2.png";
import grass3 from "../../assets/TestTiles/Grass3.png";
import grass4 from "../../assets/TestTiles/Grass4.png";
import grass5 from "../../assets/TestTiles/Grass5.png";
import hills1 from "../../assets/TestTiles/Hills1.png";
import hills2 from "../../assets/TestTiles/Hills2.png";
import hills3 from "../../assets/TestTiles/Hills3.png";
import hills4 from "../../assets/TestTiles/Hills4.png";
import hills5 from "../../assets/TestTiles/Hills5.png";
import swamp1 from "../../assets/TestTiles/Swamp1.png";
import swamp2 from "../../assets/TestTiles/Swamp2.png";
import swamp3 from "../../assets/TestTiles/Swamp3.png";
import swamp4 from "../../assets/TestTiles/Swamp4.png";
import swamp5 from "../../assets/TestTiles/Swamp5.png";
import water1 from "../../assets/TestTiles/Water1.png";
import water2 from "../../assets/TestTiles/Water2.png";
import water3 from "../../assets/TestTiles/Water3.png";
import water4 from "../../assets/TestTiles/Water4.png";
import water5 from "../../assets/TestTiles/Water5.png";
import woods1 from "../../assets/TestTiles/Woods1.png";
import woods2 from "../../assets/TestTiles/Woods2.png";
import woods3 from "../../assets/TestTiles/Woods3.png";
import woods4 from "../../assets/TestTiles/Woods4.png";
import woods5 from "../../assets/TestTiles/Woods5.png";

export class TiledScene implements CreateSceneClass {
    createScene = async (
        engine: AbstractEngine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        scene.clearColor = new Color4(1, 0, 1, 1);

        void Promise.all([
            import("@babylonjs/core/Debug/debugLayer"),
            import("@babylonjs/inspector"),
        ]).then((_values) => {
            console.log(_values);
            scene.debugLayer.show({
                handleResize: true,
                overlay: true,
                globalRoot: document.getElementById("#root") || undefined,
            });
        });

        const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 8, Vector3.Zero());
        camera.attachControl(canvas, true);
        camera.position = new Vector3(camera.position.x, camera.position.y, camera.position.z - 25);
        const light = new PointLight("Point", new Vector3(5, 10, 5), scene);
        light.intensity = 0.7;

        this.boilerplate();

        TilEdImporter.ImportMapAsync(cityTilEdMap, scene);
        TilEdImporter.ImportMapAsync(worldTilEdMap, scene);
        TilEdImporter.ImportMapAsync(hexagonalMap, scene);

        return scene;
    };

    private boilerplate() : void {
        // If we don't use the resources, they will not be deployed into the webserver,
        // and references when parsing/rendering will fail
        cityTilEdMap;
        worldTilEdMap;
        hexagonalMap;

        hexagonalTileSet;

        cityTiles;
        worldTiles;

        city1;
        city2;
        city3;
        city4;
        city5;
        grass1;
        grass2;
        grass3;
        grass4;
        grass5;
        hills1;
        hills2;
        hills3;
        hills4;
        hills5;
        swamp1;
        swamp2;
        swamp3;
        swamp4;
        swamp5;
        water1;
        water2;
        water3;
        water4;
        water5;
        woods1;
        woods2;
        woods3;
        woods4;
        woods5;
    }
}

export default new TiledScene();
