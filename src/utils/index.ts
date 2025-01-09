export * from "./Animations"
export * from "./Constants";
export * from "./CssHelpers";
export * from "./DeviceType";
export * from "./Touch";

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
 * Gets the supabase url for a file within a bucket
 * @param bucket The bucket where the file is stored
 * @param filepath The path to the file within the bucket
 * @returns A signed url to the file
 */
export function getSupabaseUrl(bucket: string, filepath: string) {
    return `${import.meta.env.IO_SUPABASE_URL}/storage/v1/object/sign/${bucket}/${filepath}`;
}

/** Extract file extension from url */
export const getFileExtension = (url: string | URL): string => {
    const path = url instanceof URL ? url.pathname : url;
    return path.split('.').pop() || '';
}

/**
 * Requests a file from a url as a blob and returns it
 * @returns A file object from the url
 */
export const urlToFile = async (image: string | URL, filename: string) => {
    const ext = getFileExtension(image);
    const response = await fetch(image);
    const blob = await response.blob();

    return new File([blob], `${filename}.${ext}`, { type: blob.type });
}

/**
 * Validates if a response is ok
 * @param response The response-like object to validate
 * @returns `true` if the response is ok, `false` otherwise
 */
export function isOk(response: { ok?: boolean, status?: number }): boolean {
    return response.status
        ? response.status >= 200 && response.status < 300
        : !!response.ok;
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