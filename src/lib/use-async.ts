import { useRef, useState } from "react";
import { useLatestFn } from "./use-latest-fn";

type PromiseDataType<T> = T extends PromiseLike<infer Data> ? Data : never;

export type UseAsyncState<FN extends (...args: any[]) => PromiseLike<any>> = {
  loading: boolean;
} & (
  | { dataReady: false; data: null; error: any }
  | { dataReady: true; data: PromiseDataType<ReturnType<FN>>; error: null }
);
export type UseAsyncResponse<FN extends (...args: any[]) => PromiseLike<any>> = {
  cancelled: boolean;
} & (
  | { ok: true; data: PromiseDataType<ReturnType<FN>>; error: null }
  | { ok: false; data: null; error: any }
);
export function useAsync<FN extends (...args: any[]) => PromiseLike<any>>(fn: FN) {
  type Args = Parameters<FN>;
  const [state, setState] = useState<UseAsyncState<FN>>({
    data: null,
    error: null,
    dataReady: false,
    loading: false,
  });
  const promiseRef = useRef<PromiseLike<UseAsyncResponse<FN>>>();
  const run = useLatestFn<(...args: Args) => PromiseLike<UseAsyncResponse<FN>>>((...args: Args) => {
    setState((old) => (old.loading ? old : { ...old, loading: true }));
    const p = fn(...args).then(
      (data) => {
        const result = { ok: true, data, error: null, cancelled: false } as const;
        if (promiseRef.current !== p) {
          return { ...result, cancelled: true };
        }
        return result;
      },
      (error) => {
        const result = { ok: false, error, data: null, cancelled: false } as const;
        if (promiseRef.current !== p) {
          return { ...result, cancelled: true };
        }
        return result;
      }
    );
    promiseRef.current = p;

    p.then(({ cancelled, ok, data, error }) => {
      if (cancelled) {
        return;
      }
      setState({ dataReady: true, data, error, loading: false });
    });
    return p;
  });
  return [run, state, fn] as const;
}
