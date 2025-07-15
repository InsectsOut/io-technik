/**
 * Type helper for a generic input event
 * This is useful for handling input events in a more type-safe manner.
 * It extends the Event type to include currentTarget and target properties.
 */
export type InputEvent<T = HTMLElement> = Event & {
    currentTarget: T;
    target: T;
}

/**
 * Type helper for a generic click event
 * This is useful for handling click events in a more type-safe manner.
 * It extends the MouseEvent type to include currentTarget and target properties.
 */
export type ClickEvent<T = HTMLElement> = MouseEvent & {
    currentTarget: T;
    target: Element;
}