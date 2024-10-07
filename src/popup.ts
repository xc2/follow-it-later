import { createRoot } from "react-dom/client";
import { jsx } from "react/jsx-runtime";
import { Popup } from "./popup/popup";
import "./globals.css";

const root = createRoot(document.getElementById("root")!);

root.render(jsx(Popup, {}));
