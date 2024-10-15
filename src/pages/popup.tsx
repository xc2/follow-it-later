import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { chainProviders } from "@/lib/providers";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { LazyMotion, MotionConfig, domMax } from "framer-motion";
import { SendScreen, SendScreenActions } from "./screens/send-screen";

export function Popup() {
  const config = chainProviders(
    (c) => <TooltipProvider>{c}</TooltipProvider>,
    (c) => <MotionConfig transition={{ duration: 0.15 }}>{c}</MotionConfig>,
    (c) => <LazyMotion features={domMax}>{c}</LazyMotion>
  );

  return config(
    <div className="min-w-96">
      <Card className="border-none rounded-none shadow-none">
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className="text-xl">Follow it later</CardTitle>
            <div className="ml-auto">
              <SendScreenActions />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SendScreen />
        </CardContent>
      </Card>
      <div className="flex border-t-[1px] border-zinc-50 py-2">
        <div className="min-w-0 flex-initial text-zinc-500 pl-2">
          This extension is <strong>UNOFFICIAL</strong>. Please DO NOT open issues on Follow's
          official repository or social accounts.
        </div>
        <Tooltip>
          <TooltipTrigger asChild className="ml-auto mr-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Feedback"
              asChild
              aria-describedby="feedback-content"
            >
              <a href="https://tldr.ws/follow-it-later-feedback" target="_blank" rel="noreferrer">
                <Pencil2Icon className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[90vw] min-w-0">
            <p id="feedback-content">
              If you got any trouble using this extension, please send your feedback here.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
