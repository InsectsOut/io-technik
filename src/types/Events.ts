export type InputEvent<T = HTMLElement> = Event & {
    currentTarget: T;
    target: T;
}

export type ClickEvent<T = HTMLElement> = MouseEvent & {
    currentTarget: T;
    target: Element;
}