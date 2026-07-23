import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Animated count-up number that triggers when scrolled into view.
 * Supports prefix (e.g. "$") and suffix (e.g. "B+", "M+", "K").
 * Live value changes are rendered immediately after the first animation.
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1800,
  decimals = 0,
  style = {},
}) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(value);
  const ref = useRef(null);
  const frame = useRef(null);

  const animate = useCallback(() => {
    const start = performance.now();
    const end = Number.isFinite(value) ? value : 0;
    setAnimatedValue(end);
    if (frame.current) cancelAnimationFrame(frame.current);

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(end * eased);

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        frame.current = null;
      }
    }

    frame.current = requestAnimationFrame(tick);
  }, [duration, value]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated((alreadyAnimated) => {
            if (!alreadyAnimated) animate();
            return true;
          });
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [animate]);

  const currentDisplay = hasAnimated && value !== animatedValue
    ? value
    : display;
  const formatted = decimals > 0
    ? currentDisplay.toFixed(decimals)
    : Math.round(currentDisplay);

  return (
    <span ref={ref} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
