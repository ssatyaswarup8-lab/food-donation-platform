import { useState, useRef, useEffect } from "react";

// Smoothly animates a [lng, lat] position from its old value to a new one
// over `duration` ms, instead of jumping instantly (mimics Uber's car glide).
export const useSmoothMarker = (targetCoords, duration = 2000) => {
  const [animatedCoords, setAnimatedCoords] = useState(targetCoords);
  const frameRef = useRef(null);
  const startCoordsRef = useRef(targetCoords);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!targetCoords) return;

    startCoordsRef.current = animatedCoords || targetCoords;
    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);

      const from = startCoordsRef.current;
      const to = targetCoords;

      const lng = from[0] + (to[0] - from[0]) * t;
      const lat = from[1] + (to[1] - from[1]) * t;

      setAnimatedCoords([lng, lat]);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCoords?.[0], targetCoords?.[1]]);

  return animatedCoords;
};