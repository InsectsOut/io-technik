export * from "./CssHelpers";
export * from "./DeviceType";

/** Image file extension */
export type ImgFile = {
    /** The file blob to be uploaded */
    file: File;
    /** The image extension */
    extension: string;
    /** A unique img id */
    id: string;
}

/**
 * Delays a `Promise` by the provided miliseconds
 * @param ms Miliseconds before the promise is resolved
 */
export const delay = (ms: number): Promise<any> => {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    })
}