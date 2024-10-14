import { Button, type ButtonProps } from "@/components/ui/button";
import { AvatarIcon } from "@radix-ui/react-icons";

export function Login({ purpose, ...props }: { purpose: string } & ButtonProps) {
  return (
    <div>
      <Button asChild size="sm" type="button" {...props}>
        <a href="https://app.follow.is/login" target="_blank" rel="noreferrer">
          <AvatarIcon className="mr-2 h-4 w-4" />
          Log in Follow
        </a>
      </Button>
      {!purpose || <div className="text-zinc-500 mt-2">{purpose}</div>}
    </div>
  );
}
