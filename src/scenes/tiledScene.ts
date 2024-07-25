import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color4 } from "@babylonjs/core";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { CreateSceneClass } from "../createScene";
import { TilEdImporter } from "../tiled/tilEdImporter";
import { TilEdRenderer } from "../tiled/tilEdRenderer";

export class TilEdScene implements CreateSceneClass {
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

        const cityMap = await TilEdImporter.ImportMapAsync('http://localhost:8080/maps/cityMap.tmx', scene);
        //const worldMap = await TilEdImporter.ImportMapAsync('http://localhost:8080/maps/worldMap.tmx', scene);
        //const hexMap = await TilEdImporter.ImportMapAsync('http://localhost:8080/maps/HexagonalMap.tmx', scene);

        //await TilEdRenderer.DebugImageTileset(hexMap.tilesets[0], scene);
        TilEdRenderer.DebugTileset(cityMap.tilesets[0], scene);
        //TilEdRenderer.RenderTilemap(cityMap, scene);

        return scene;
    };
}

export default new TilEdScene();