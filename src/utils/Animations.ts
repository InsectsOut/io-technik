import { Options as MotionOptions } from 'solid-motionone';

/** Animation that renders and element fading in */
export const FadeInAnimation: MotionOptions = {
  animate: { opacity: [0, 1] },
  exit: { opacity: [1, 0] },
  transition: {
    easing: "ease-in-out",
    duration: 0.7,
  }
};

/** Animation that renders an element sliding down and fading in */
export const SlideDownFadeIn: MotionOptions = {
  animate: { top: [0, "2rem"], opacity: [0, 1] },
  exit: { opacity: [1, 0] },
  transition: {
    easing: "ease-in-out",
    duration: 0.7,
  },
};

/** Animation that renders an element sliding down */
export const SlideDown: MotionOptions = {
  animate: { y: ["-2rem", 0], opacity: [0.25, 1] },
  exit: { opacity: [1, 0] },
  transition: {
    easing: "ease-in-out",
    duration: 0.5,
  },
}