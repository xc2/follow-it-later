export function skipNil<T>(v: T | undefined | null): v is T {
  return v !== undefined && v !== null;
}

export function addProperties<T, O extends Record<PropertyKey, unknown>>(
  original: T,
  add: O
): T & O {
  for (const [key, value] of Object.entries(add)) {
    Object.defineProperty(original, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  return original as T & O;
}

export async function destructPromise<Data, Err extends Error = Error>(
  promise: PromiseLike<Data>
): Promise<[false, Err] | [true, Data]> {
  try {
    const data = await promise;
    return [true, data];
  } catch (e) {
    return [false, e as Err];
  }
}

export function isPromiseLike<T>(p: unknown): p is PromiseLike<T> {
  return Boolean(p && typeof (p as any)?.then === "function");
}
