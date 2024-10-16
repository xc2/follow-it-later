import { addProperties } from "@/lib/lang";
import { type Getter, atom } from "jotai";
import { loadable as jotaiLoadable, selectAtom } from "jotai/utils";
import type { Atom, WritableAtom } from "jotai/vanilla";
import type { Loadable } from "jotai/vanilla/utils/loadable";

type Read<Value, Args extends unknown[], Result> = (
  get: Getter,
  options: {
    readonly signal: AbortSignal;
    readonly setSelf: (...args: Args) => Result;
    readonly initial: boolean;
  }
) => Value;
type Write<Value, Args extends unknown[], Result> = WritableAtom<
  Value,
  [() => void, ...Args],
  Result
>["write"];

type ExtraAtoms<Value> = {
  loadable: () => Atom<Loadable<Value>>;
  unwrap: () => Atom<Awaited<Value> | undefined>;
  initial: Atom<boolean>;
};

export type ReadOnlyAsyncAtom<Value> = WritableAtom<Value, [], void> & ExtraAtoms<Value>;
export type ReadWriteAsyncAtom<Value, Args extends unknown[], Result> = WritableAtom<
  Value,
  Args | [],
  Result | undefined
> &
  ExtraAtoms<Value>;

export function asyncAtom<Value>(read: Read<Value, [], void>): ReadOnlyAsyncAtom<Value>;
export function asyncAtom<Value, Args extends unknown[], Result>(
  read: Read<Value, Args, Result>,
  write: Write<Value, Args, Result>
): ReadWriteAsyncAtom<Value, Args, Result>;
export function asyncAtom<Value, Args extends unknown[], Result>(
  read: Read<Value, Args, Result>,
  write?: Write<Value, Args, Result>
): ReadOnlyAsyncAtom<Value> | ReadWriteAsyncAtom<Value, Args, Result> {
  const refreshAtom = atom(0);
  const initialAtom = atom((get) => get(refreshAtom) === 0);

  // @ts-ignore
  const baseAtom = atom<Value, Args, Result>(
    (get, options) => {
      const times = get(refreshAtom);
      return read(get, addProperties(options, { initial: times === 0 }));
    },
    (get, set, ...args: Args) => {
      const refresh = () => set(refreshAtom, (c) => c + 1);
      if (args.length === 0) {
        refresh();
      } else if (write) {
        return write(get, set, refresh, ...args);
      }
    }
  );
  let loadableAtom: Atom<Loadable<Value>>;
  let unwrappedAtom: Atom<Awaited<Value> | undefined>;
  // @ts-ignore
  return addProperties(baseAtom, {
    loadable,
    unwrap,
    initial: initialAtom,
  });

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
