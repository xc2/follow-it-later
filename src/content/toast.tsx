import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import type { ExternalToast } from "sonner";
import { toast as sonner } from "sonner";
import css from "./toast.css?inline";

function getContainer() {
  const id = `root-${chrome.runtime.id}`;
  let root = document.getElementById(id);
  if (root) return root.shadowRoot || root.attachShadow({ mode: "open" });
  root = document.createElement("div");
  root.id = id;

  document.body.appendChild(root);
  return root.shadowRoot || root.attachShadow({ mode: "open" });
}
function OnReady({ onReady }: { onReady: () => any }) {
  useLayoutEffect(() => {
    return onReady();
  }, []);
  return null;
}

async function prepareToaster(): Promise<void> {
  const container = getContainer();
  const id = `toaster-${chrome.runtime.id}`;
  if (container.querySelector(`#${id}`)) return;
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
  return new Promise((resolve, reject) => {
    createRoot(toaster).render(
      <ThemeProvider attribute="data-ignore-theme">
        <Toaster />
        <OnReady
          onReady={() => {
            resolve();
          }}
        />
      </ThemeProvider>
    );
  });
}

export async function toast(
  message: string,
  data?: ExternalToast & { type?: "success" | "info" | "warning" | "error" | "loading" }
) {
  await prepareToaster();
  const showToast = sonner[data?.type || "info"] || sonner;
  return showToast(message, {
    position: "top-center",
    ...data,
  });
}
export const dismiss = sonner.dismiss;

export type Export = {
  toast: typeof toast;
  dismiss: typeof dismiss;
};
