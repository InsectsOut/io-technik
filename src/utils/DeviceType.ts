import { createWindowSize } from "@solid-primitives/resize-observer";

/** Types of devices by their max width */
export const enum DeviceType {
    /** Max width size for a mobile device */
    Mobile = 700,
    /** Max width size for a tablet device */
    Tablet = 1000,
    /** Max width size for a laptop device */
    Laptop = 1400,
    /** Max width size for a ultrawide device */
    Ultrawide = 2000
}

/**
 * Readonly signal that returns the current device type
 * @returns An Accesor<DeviceType> with the current type
 */
export const deviceType = () => getDeviceType((createWindowSize()).width);

/**
 * Gets the current device type by screen width 
 * @param width The current window width
 * @returns A `DeviceType` category
 */
export function getDeviceType(width: number): DeviceType {
    switch (true) {
        case width <= DeviceType.Mobile:
            return DeviceType.Mobile;
        case width <= DeviceType.Tablet:
            return DeviceType.Tablet;
        case width <= DeviceType.Laptop:
            return DeviceType.Laptop;
        default:
            return DeviceType.Ultrawide;
    }
}

/** Returns if the current device type is a mobile device */
export function isMobile() {
    return deviceType() === DeviceType.Mobile;
}

/** Returns if the current device type is a tablet */
export function isTablet() {
    return deviceType() === DeviceType.Tablet;
}

/** Returns if the current device type is a laptop */
export function isLaptop() {
    return deviceType() === DeviceType.Laptop;
}

/** Returns if the current device type is ultrawide */
export function isUltrawide() {
    return deviceType() === DeviceType.Ultrawide;
}