import { Options as MotionOptions } from 'solid-motionone';

/** Animation options for Motion */
export const FadeOutAnimation: MotionOptions = {
  animate: { opacity: [0, 1] },
  exit: { opacity: [1, 0] },
  transition: {
    easing: "ease-in-out",
    duration: 0.7,
  }
};

// Animation options
export const SlideDownFadeIn: MotionOptions = {
  animate: { top: [0, "2rem"], opacity: [0, 1] },
  exit: { opacity: [1, 0] },
  transition: {
    easing: "ease-in-out",
    duration: 0.7,
  },
};