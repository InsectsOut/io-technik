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

export function isMobile(width: number) {
    return getDeviceType(width) === DeviceType.Mobile;
}

export function isTablet(width: number) {
    return getDeviceType(width) === DeviceType.Tablet;
}

export function isLaptop(width: number) {
    return getDeviceType(width) === DeviceType.Laptop;
}

export function isUltrawide(width: number) {
    return getDeviceType(width) === DeviceType.Ultrawide;
}