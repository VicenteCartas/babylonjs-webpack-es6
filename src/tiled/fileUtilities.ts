export class FileUtilities {
    public static async requestFile(url: URL): Promise<string> {
        // TODO: Use Babylon fileTools.ts -> RequestFile
        // TODO: check xmlLoader.ts
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error loading file ${url} . Response status: ${response.status}`);
            }

            const textData = await response.text();
            return textData;
        } catch (error: unknown) {
            console.error((error as Error).message);
            return Promise.reject();
        }
    }
}