import { interpolate } from "flubber";
import { animate, useMotionValue, useTransform } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

export function useMorphing(path: string) {
  const prevRef = useRef(path);
  const prev = prevRef.current;
  prevRef.current = path;
  const v = useMotionValue(0);
  const list = [v.get(), v.get() + 1];
  useLayoutEffect(() => {
    if (path !== prev) {
      const c = animate(v, v.get() + 1, {
        duration: 0.2,
      });
      return () => c.stop();
    }
  }, [path]);

  return useTransform(v, list, [prev, path], {
    mixer: (a, b) => {
      if (a && b && a !== b) {
        return interpolate(a, b, { maxSegmentLength: 1 });
      }
      return () => a || b;
    },
  });
}
