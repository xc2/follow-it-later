import { Export } from "@/content/toast";
import { getContentClient } from "@/lib/chrome/call-content";
import { toastModuleUrl } from "@/lib/urls";

export const toastClient = getContentClient<Export>(toastModuleUrl);
