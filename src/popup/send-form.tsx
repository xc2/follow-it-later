import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentTabToInboxData } from "@/lib/backend";
import { useAsync } from "@/lib/use-async";
import { InboxItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon, PaperPlaneIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  inbox: z.string(),
});
type FormSchema = z.infer<typeof formSchema>;

export function SendForm({
  inboxes,
  defaultValues,
}: { inboxes: InboxItem[]; defaultValues?: Partial<FormSchema> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [send, result] = useAsync(async (values: z.infer<typeof formSchema>) => {
    chrome.storage.local.set({ "inbox-last-used": values.inbox }).catch(() => {});
    const result = await currentTabToInboxData();
    const inbox = inboxes.find((inbox) => inbox.id === values.inbox)!;
    await fetch("https://api.follow.is/inboxes/webhook", {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Follow-Secret": inbox.secret,
        "X-Follow-Handle": inbox.id,
      },
      body: JSON.stringify(result),
    });
    return { result, inbox };
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => send(values);
  const { isSubmitting, isLoading, isValid, isSubmitSuccessful, isSubmitted, disabled } =
    form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FormField
            control={form.control}
            name="inbox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inbox</FormLabel>
                <FormControl>
                  <Select {...field} defaultValue={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Choose a inbox" />
                    </SelectTrigger>
                    <SelectContent className="bottom-[0]" position="item-aligned">
                      {inboxes.map((inbox) => {
                        return (
                          <SelectItem value={inbox.id} key={inbox.id}>
                            <span>
                              {inbox.title}
                              <span className="ml-2 text-foreground/50">{inbox.id}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Button type="submit" disabled={isSubmitting || isLoading || disabled}>
              {isSubmitting ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PaperPlaneIcon className="mr-2 h-4 w-4" />
              )}
              Send to Follow
            </Button>
            {!(!result.loading && (result.data || result.error)) || (
              <div className="mt-3 w-full">
                {!result.error ? (
                  <div>
                    Page "{result.data?.result.title}" was sent to inbox "{result.data?.inbox.title}
                    " successfully.
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />

                    <AlertTitle>Sending Failed</AlertTitle>
                    <AlertDescription>{result.error?.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
