import { settingsAtom } from "@/backend/atoms";
import { authStateAtom } from "@/backend/atoms/follow-client";
import { createStore } from "jotai";

export const container = createStore();
container.sub(settingsAtom, () => {});

container.sub(authStateAtom, () => {});
