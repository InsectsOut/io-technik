interface SwipeOptions {
    /** Minimum distance for a swipe to be recognized */
    threshold?: number;
}

export type SwipeDirection = "left" | "right";

export type SwipeCallback = (direction: SwipeDirection, distance: number) => void;

/**
 * 
 * @param element 
 * @param onSwipe 
 * @param options 
 * @returns 
 */
export function useSwipe(
    element: HTMLElement,
    onSwipe: SwipeCallback,
    options: SwipeOptions = {}
): () => void {
    const { threshold = 50 } = options; // Default threshold is 50px
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        touchEndX = e.changedTouches[0].clientX;
        const distance = touchEndX - touchStartX;

        if (distance > threshold) {
            onSwipe('right', distance);
        } else if (distance < -threshold) {
            onSwipe('left', distance);
        }
    };

    // Attach event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    // Cleanup function to remove listeners
    return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
    };
}
