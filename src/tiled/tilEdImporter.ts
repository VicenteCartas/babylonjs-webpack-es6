import { Scene } from "@babylonjs/core";
import { TilEdMap } from "./tilEd.types";
import { TilEdParser } from "./tilEdParser";

export class TiledImporter {
    public static async ImportMapAsync(rootUrl: string, scene: Scene): Promise<TilEdMap> {
        const mapData = await TiledImporter.requestMap(rootUrl);
        return TilEdParser.parseMapData(mapData);
    }

    private static async requestMap(rootUrl: string): Promise<string> {
        // TODO: Use Babylon fileTools.ts -> RequestFile
        // TODO: check xmlLoader.ts
    
        try {
            const response = await fetch(rootUrl);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const textData = await response.text();
            return textData;
        } catch (error: unknown) {
            console.error((error as Error).message);
            return Promise.reject();
        }
    }
}