import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import citySpriteMapTextureUrl from "../../assets/galletcity_tiles.png";
import cityTilesetUrl from "../../assets/galletcity_tiles.tsx2";
import { DefaultLoadingScreen } from "@babylonjs/core/Loading";
import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";

export class TilEdSpriteMap implements CreateSceneClass {
    private assetsManager: AssetsManager | undefined;

    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        this.assetsManager = new AssetsManager(scene);

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
        const light = new PointLight("Point", new Vector3(5, 10, 5), scene);
        light.intensity = 0.7;

         // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
        const spriteSheet = new Texture(citySpriteMapTextureUrl, scene,
            false, //NoMipMaps
            false, //InvertY usually false if exported from TexturePacker
            Texture.NEAREST_NEAREST, //Sampling Mode
            null, //Onload, you could spin up the sprite map in a function nested here
            null, //OnError
            null, //CustomBuffer
            false, //DeleteBuffer
            Engine.TEXTUREFORMAT_RGBA //ImageFormageType RGBA
        );

        console.log("Before atlas json");
        const atlasJson = this.TilEdTilesetToAtlasJson(cityTilesetUrl);

        // groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);






        // // This creates and positions a free camera (non-mesh)
        // const camera = new ArcRotateCamera(
        //     "my first camera",
        //     0,
        //     Math.PI / 3,
        //     10,
        //     new Vector3(0, 0, 0),
        //     scene
        // );

        // // This targets the camera to scene origin
        // camera.setTarget(Vector3.Zero());

        // // This attaches the camera to the canvas
        // camera.attachControl(canvas, true);

        // // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        // // const light = new HemisphericLight(
        // //     "light",
        // //     new Vector3(0, 1, 0),
        // //     scene
        // // );

        // // // Default intensity is 1. Let's dim the light a small amount
        // // light.intensity = 0.7;

        // // Our built-in 'sphere' shape.
        // const sphere = CreateSphere(
        //     "sphere",
        //     { diameter: 2, segments: 32 },
        //     scene
        // );

        // // Move the sphere upward 1/2 its height
        // sphere.position.y = 1;

        // // Our built-in 'ground' shape.
        // const ground = CreateGround(
        //     "ground",
        //     { width: 6, height: 6 },
        //     scene
        // );

        // // Load a texture to be used as the ground material
        // const groundMaterial = new StandardMaterial("ground material", scene);
        // groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);

        // ground.material = groundMaterial;
        // ground.receiveShadows = true;

        // const light = new DirectionalLight(
        //     "light",
        //     new Vector3(0, -1, 1),
        //     scene
        // );
        // light.intensity = 0.5;
        // light.position.y = 10;

        // const shadowGenerator = new ShadowGenerator(512, light)
        // shadowGenerator.useBlurExponentialShadowMap = true;
        // shadowGenerator.blurScale = 2;
        // shadowGenerator.setDarkness(0.2);

        // shadowGenerator.getShadowMap()!.renderList!.push(sphere);

        return scene;
    };

    private TilEdTilesetToAtlasJson(tilesetUrl: string): AtlasJson | undefined {
        if (!this.assetsManager) {
            return;
        }

        console.log("Before text task");
        const textTask = this.assetsManager.addTextFileTask("text task", tilesetUrl);
        console.log("After text task");
        textTask.onSuccess = (task) => {
            console.log("Before parsing DOM");
            const parser = new DOMParser();
            const document = parser.parseFromString(task.text, "application/xml");
            console.log(task.text);
            console.log(document);
        }

        console.log("After text task 2");

        textTask.onError = (task, message, exception) => {
            console.log(message);
            console.log(exception);
        }

        console.log("After text task 3");

        this.assetsManager.load();
        const atlasJson: AtlasJson = {
            tiles: [],
            meta: {
                app: "https://www.mapeditor.org/",
                version: "1.0",
                image: "galletcity_tiles.png",
                format: "RGBA8888",
                size: {
                    w: 256,
                    h: 256
                },
                scale: 1,
                smartupdate: ""
            }
        }

        return atlasJson;
    }
}

type AtlasJson = {
    tiles: AtlasJsonTile[];
    meta: AtlasJsonMeta;
}

type AtlasJsonMeta = {
    app: string;
    version: string;
    image: string;
    format: string;
    size: Size;
    scale: number;
    smartupdate: string;
}

type AtlasJsonTile = {
    fileName: string;
    frame: Rectangle;
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: Rectangle;
    sourceSize: Size;
}

type Rectangle = {
    x: number;
    y: number;
    w: number;
    h: number;
}

type Size = {
    w: number;
    h: number;
}

export default new TilEdSpriteMap();
