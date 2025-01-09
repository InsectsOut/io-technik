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