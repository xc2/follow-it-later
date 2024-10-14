import { skipNil } from "@/lib/lang";
import type { ReactNode } from "react";

export function chainProviders(...providers: ((c: ReactNode) => ReactNode)[]) {
  return function render(children: ReactNode) {
    return providers.filter(skipNil).reduceRight((f, fn) => fn(f), children);
  };
}
