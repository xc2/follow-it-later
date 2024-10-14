import { SettingsSchema } from "@/backend/entities";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useAsync } from "@/lib/use-async";
import { internal } from "@/services/internal";
import { InboxItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { SaveAllIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof SettingsSchema>;

export function SettingsForm({
  inboxes,
  defaultValues,
}: { inboxes: InboxItem[]; defaultValues?: Partial<FormSchema> }) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(SettingsSchema),
    defaultValues,
  });

  const [save, result] = useAsync(async (values: FormSchema) => {
    await internal.PUT("/settings", { body: values });
  });
  const onSubmit = (values: FormSchema) => save(values);
  const { isSubmitting, isLoading, isValid, isSubmitSuccessful, isSubmitted, disabled } =
    form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FormField
            control={form.control}
            name="DefaultInbox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Inbox</FormLabel>
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
                <FormDescription>
                  Pages will be sent to the selected inbox by default when you click the extension
                  icon or the context menu item.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Button size="sm" type="submit" disabled={isSubmitting || isLoading || disabled}>
              {isSubmitting ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveAllIcon className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
            {!(!result.loading && (result.dataReady || result.error)) || (
              <div className="mt-3 w-full">
                {!result.error ? (
                  <div>Saved</div>
                ) : (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />

                    <AlertTitle>Save Failed</AlertTitle>
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
