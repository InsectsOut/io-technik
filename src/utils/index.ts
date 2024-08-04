export * from "./CssHelpers";

/** Helper that returns a union of `T | undefined` */
export type Some<T> = T | undefined;

/**
 * Delays a `Promise` by the provided miliseconds
 * @param ms Miliseconds before the promise is resolved
 */
export const delay = (ms: number): Promise<any> => {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    })
}