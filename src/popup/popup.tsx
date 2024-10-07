import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useSWR from "swr";
// @ts-ignore
import readScriptUrl from "../content/read.ts?script";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  inbox: z.string(),
});

export function Popup() {
  const inboxesSWR = useSWR("inboxes", async (url) => {
    const res = await fetch("https://api.follow.is/inboxes/list", {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    const data = await res.json();
    return data.data;
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const tab = await chrome.tabs.query({ active: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab[0].id! },
      files: [readScriptUrl],
    });
  }
  return (
    <div className="px-5 py-6 min-h-96">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="inbox"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3">
                  <FormLabel>Inbox</FormLabel>
                  <FormControl>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose a inbox" />
                      </SelectTrigger>
                      <SelectContent className="bottom-[0]" position="item-aligned">
                        {inboxesSWR.data?.map((inbox) => {
                          return (
                            <SelectItem value={inbox.id} key={inbox.id}>
                              {inbox.title}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </div>

                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send to Follow</Button>
        </form>
      </Form>
    </div>
  );
}
