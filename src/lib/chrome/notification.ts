import { toastClient } from "@/content/toast.backend";

export function withNotification<T>({
  title,
  handler: p,
  pending,
  done,
  fail,
  tabId,
  disabled,
}: {
  title: string;
  handler: PromiseLike<T> | (() => PromiseLike<T>);
  pending?: string;
  done?: string | ((data: T) => string);
  fail?: string | ((e: unknown) => string);
  tabId?: number;
  disabled?: boolean;
}) {
  const t = tabId ? toastClient.for(tabId) : toastClient;
  p = typeof p === "function" ? p() : p;
  if (disabled) return p;
  const pid = t.toast(title, { description: pending || "Loading...", type: "loading" });
  p.then(
    async (data) => {
      const id = await pid;
      const message = typeof done === "function" ? done(data) : done;
      void t.toast(title, { id, description: message || "Done!", type: "success" });
      setTimeout(() => {
        void t.dismiss(id);
      }, 2000);
    },
    async (e) => {
      console.error(e);
      const id = await pid;
      const message = typeof fail === "function" ? fail(e) : fail;
      void t.toast(title, {
        id,
        description: message || `Failed: ${e.message}`,
        duration: 20000,
        closeButton: true,
        type: "error",
      });
    }
  );
  return p;
}
