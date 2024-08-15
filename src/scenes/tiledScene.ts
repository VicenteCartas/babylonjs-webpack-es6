import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4, FreeCamera, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { CreateSceneClass } from "../createScene";
import { TilEdImporter } from "../tiled/tilEdImporter";
import { getTiledSpriteMap } from "../tiled/getTiledSpriteMap";

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

        const importer = new TilEdImporter();
        //const map = await TilEdImporter.ImportMapAsync('http://localhost:8080/maps/NewRenderingMap.tmx', scene);
        const map = await TilEdImporter.ImportMapAsync('http://localhost:8080/maps/cityMap.tmx', scene);
        //const map = await TilEdImporter.ImportMapAsync('http://localhost:8080/maps/worldMap.tmx', scene);
        const spriteMap = getTiledSpriteMap(map, scene);
        const size = spriteMap.getMapPixelSize();
        const groundTexture = await spriteMap.renderToTexture();

        const mat = new StandardMaterial("");
	    mat.diffuseTexture = groundTexture;

        const f = new Vector4(0, 0, 1, 1); // front image = half the whole image along the width 
        const b = new Vector4(0, 0, 1, 1); // back image = second half along the width
        
        const plane = MeshBuilder.CreatePlane("plane", { width: size.x, height: size.y, frontUVs: f, backUVs: b, sideOrientation: Mesh.FRONTSIDE});
        plane.material = mat;

        // // Our built-in 'ground' shape.
        // var ground = MeshBuilder.CreateGround("ground", {width: size.x, height: size.y}, scene);
        // let groundMaterial = new StandardMaterial("Ground Material", scene);
        // //let groundTexture = new Texture('http://localhost:8080/maps/SimpleImage.png', scene);
        // //groundMaterial.diffuseColor = Color3.Red();
        // groundMaterial.diffuseTexture = groundTexture;
        // ground.material = groundMaterial;


        
        return scene;
    };
}

export default new TilEdScene();