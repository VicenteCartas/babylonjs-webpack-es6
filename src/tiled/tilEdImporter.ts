import { Scene } from "@babylonjs/core";
import { TilEdMap } from "./tilEd.types";
import { TilEdParser } from "./tilEdParser";
import { FileUtilities } from "./fileUtilities";

export class TilEdImporter {
    public static async ImportMapAsync(rootUrl: string, scene: Scene): Promise<TilEdMap> {
        const mapData = await FileUtilities.requestFile(rootUrl);
        console.log(mapData);
        const mapObject = await TilEdParser.parseMapData(mapData);
        console.log(mapObject);
        return mapObject;
    }
}