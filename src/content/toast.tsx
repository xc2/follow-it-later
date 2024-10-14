import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { createRoot } from "react-dom/client";
import type { ExternalToast } from "sonner";
import css from "./toast.css?inline";

function getContainer() {
  const id = "follow-it-later-root";
  let root = document.getElementById(id);
  if (root) return root.shadowRoot || root.attachShadow({ mode: "open" });
  root = document.createElement("div");
  root.id = id;

  document.body.appendChild(root);
  return root.shadowRoot || root.attachShadow({ mode: "open" });
}

function prepareToaster() {
  const container = getContainer();
  const id = "follow-it-later-toaster";
  if (!container.querySelector(`#${id}`)) {
    const toaster = document.createElement("div");
    toaster.id = id;
    container.appendChild(toaster);
    const style = document.createElement("style");
    style.textContent = css;
    container.appendChild(style);
    for (const s of Array.from(document.head.querySelectorAll<HTMLStyleElement>("style"))) {
      if (s.textContent?.includes("[data-sonner-toaster]")) {
        container.appendChild(s.cloneNode(true));
      }
    }
    createRoot(toaster).render(
      <ThemeProvider attribute="data-ignore-theme">
        <Toaster />
      </ThemeProvider>
    );
  }
}

export async function toast(
  message: string,
  data?: ExternalToast & { type?: "success" | "info" | "warning" | "error" | "loading" }
) {
  prepareToaster();
  const { toast: _showToast } = await import("sonner");
  const showToast = _showToast[data?.type || "info"] || _showToast;
  return showToast(message, {
    position: "top-center",
    ...data,
  });
}
export async function dismiss(id: number | string) {
  const { toast } = await import("sonner");
  return toast.dismiss(id);
}

export type Export = {
  toast: typeof toast;
  dismiss: typeof dismiss;
};
