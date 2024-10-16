import { authStateAtom, settingsAtom } from "@/backend/atoms";
import { createStore } from "jotai";

export const container = createStore();
container.sub(settingsAtom, () => {});

container.sub(authStateAtom, async () => {
  if (import.meta.env.DEV) {
    console.log("authStateAtom changed", await container.get(authStateAtom));
  }
});
