import { Export } from "@/content/read";
import { getContentClient } from "@/lib/chrome/call-content";
import { readModuleUrl } from "@/lib/urls";

export const readClient = getContentClient<Export>(readModuleUrl);
