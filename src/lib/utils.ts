import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function startSpin(interval: number, onSpin: (spin: string) => void) {
  function getSpin() {
    const spin = "...";
    const l = (Date.now() / interval) % spin.length;
    return spin.slice(0, l + 1);
  }

  onSpin(getSpin());

  const timer = setInterval(() => {
    onSpin(getSpin());
  }, interval);

  function dispose() {
    clearInterval(timer);
  }
  return dispose;
}
