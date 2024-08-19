import { Scene } from "@babylonjs/core";
import { TilEdMap } from "./tilEd.types";
import { TilEdParser } from "./tilEdParser";
import { FileUtilities } from "./fileUtilities";

export class TilEdImporter {
    public static async ImportMapAsync(rootUrl: string, scene: Scene): Promise<TilEdMap> {
        const url = new URL(rootUrl);
        const mapData = await FileUtilities.requestFile(url);
        const mapObject = await TilEdParser.parseMapData(mapData, url);
        console.log(mapObject);
        return mapObject;
    }
}