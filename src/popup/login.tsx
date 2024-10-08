import { Button } from "@/components/ui/button";

export function Login() {
  const login = () => {
    window.open("https://app.follow.is/login", "_blank");
  };
  return (
    <Button type="button" onClick={() => login()}>
      Login Follow
    </Button>
  );
}
