import { inboxesAtom, settingsAtom } from "@/backend/atoms";
import { createStore } from "jotai";

export const container = createStore();
container.sub(settingsAtom, () => {});

container.sub(inboxesAtom, () => {
  console.log("inboxesAtom changed", container.get(inboxesAtom));
});
