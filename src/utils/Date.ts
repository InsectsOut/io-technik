import { LocaleMX } from "@/constants";

/**
 * Gets a user friendly time string.
 * @param date The date to use for the time string.
 * @returns A string formatted in a locale friendly manner if a date is provided.
 */
export function getLocalTime(date?: Date | null): string {
    return date ? date.toLocaleTimeString(LocaleMX, {
        minute: "2-digit",
        hour: "2-digit",
        hour12: true,
    }) : "";
}