import { useAsync } from "@/components/hooks/use-async";
import { useAsyncStateWithPeace } from "@/components/hooks/use-async-state-with-peace";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckIcon, ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { isMotionValue, m } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const MotionButton = m.create(Button);
export type MotionButtonProps = ComponentPropsWithoutRef<typeof MotionButton>;
export type AsyncButtonProps = MotionButtonProps & {
  end?: ReactNode;
  start?: ReactNode;
  statePosition?: "start" | "end";
  handler?: () => PromiseLike<any>;
};

export function AsyncButton({
  handler,
  className,
  children,
  onClick,
  start,
  end,
  statePosition = "start",
  ...props
}: AsyncButtonProps) {
  const [send, { loading, dataReady, error }] = useAsync(handler || (async () => {}));

  const iconClassNames = `size-4`;
  const [state, isPeace] = useAsyncStateWithPeace({ loading, dataReady, error });
  const stateIcon = (() => {
    if (state === "fail") {
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span
              className="cursor-auto"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              <ExclamationTriangleIcon className={iconClassNames} />
            </span>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              className="cursor-auto select-auto max-w-[98vw] whitespace-normal break-words rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none"
            >
              {error?.message || "An error occurred"}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      );
    }
    if (isPeace) return null;
    if (state === "running") return <ReloadIcon className={cn(iconClassNames, "animate-spin")} />;
    if (state === "success") return <CheckIcon className={iconClassNames} />;
    return null;
  })();

  const startNode = (statePosition === "start" ? stateIcon : null) || start || null;
  const endNode = (statePosition === "end" ? stateIcon : null) || end || null;

  return (
    <MotionButton
      {...props}
      className={cn("gap-2", className)}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      onClick={(e) => {
        onClick?.(e);
        if (!e.isDefaultPrevented() && handler) {
          void send();
        }
      }}
    >
      {startNode || null}

      {isMotionValue(children) ? children.get() : children}
      {endNode ? <div className="ml-auto">{endNode}</div> : null}
    </MotionButton>
  );
}
