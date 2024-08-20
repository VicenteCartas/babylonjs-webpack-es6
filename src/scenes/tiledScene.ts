import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4, FreeCamera, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { CreateSceneClass } from "../createScene";
import { loadSpriteMap } from "../tiled/loadSpriteMap";

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

        const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, Vector3.Zero());
        camera.attachControl(canvas, true);
        const light = new HemisphericLight("light", new Vector3(1, 1, 0));
        light.intensity = 10;

        //const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 8, Vector3.Zero());
        //camera.position = new Vector3(camera.position.x, camera.position.y + 100, camera.position.z - 100);
        //camera.attachControl(canvas, true);
        //const light = new PointLight("Point", new Vector3(5, 10, 5), scene);
        //light.intensity = 0.7;

        // New SpriteMap rendering
        //await loadSpriteMap('http://localhost:8080/maps/NewRenderingMap.tmx', scene);
        //await loadSpriteMap('http://localhost:8080/maps/Transparencies.tmx', scene);
        //await loadSpriteMap('http://localhost:8080/maps/cityMap.tmx', scene);
        //await loadSpriteMap('http://localhost:8080/maps/worldMap.tmx', scene);
        await loadSpriteMap('http://localhost:8080/maps/HexagonalMap.tmx', scene);

        return scene;
    };
}

export default new TilEdScene();