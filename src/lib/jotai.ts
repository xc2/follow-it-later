import { addProperties } from "@/lib/lang";
import { atomWithRefresh, loadable as jotaiLoadable, selectAtom } from "jotai/utils";
import type { Atom, WritableAtom } from "jotai/vanilla";
import type { Loadable } from "jotai/vanilla/utils/loadable";

type Read<Value, Args extends unknown[], Result> = WritableAtom<Value, Args, Result>["read"];

export function asyncAtom<Value>(read: Read<Value, [], void>) {
  const baseAtom = atomWithRefresh(read);
  let loadableAtom: Atom<Loadable<Value>>;
  let unwrappedAtom: Atom<Awaited<Value> | undefined>;
  return addProperties(baseAtom, { loadable, unwrap });

  function loadable() {
    loadableAtom = loadableAtom || jotaiLoadable(baseAtom);
    return loadableAtom;
  }

  function unwrap() {
    unwrappedAtom =
      unwrappedAtom ||
      selectAtom(loadable(), (s, prevSlice) => {
        if (s.state === "loading") return prevSlice;
        if (s.state === "hasData") return s.data;
        return undefined;
      });
    return unwrappedAtom;
  }
}
