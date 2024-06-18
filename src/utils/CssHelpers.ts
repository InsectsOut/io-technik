/** A `CSS` style that can be toggle if the boolean arg is `true` */
type ConditionalStyle = [string, boolean];

/**
 * Helper that concates `css` styles into a single declaration.
 * Accepts either a simple `string` style, or a tuple with the style and a flag
 * to enable or disable it in the resulting string.
 * @param styles The styles to be concatenated into a single string.
 * @returns A `string` with the concatenated styles, if any.
 */
export function classNames(...styles: Array<string | ConditionalStyle>): string {
    if (!styles || !styles.length) {
        return "";
    }

    return styles.map((arg) => {
        if (typeof arg === "string") {
            return arg;
        }

        const [style, enabled] = arg;
        return enabled ? style : "";
    }).join(" ").trim();
}