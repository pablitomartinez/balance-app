import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  onSignOut: () => Promise<void>;
  className?: string;
  showIcon?: boolean;
};

export function SignOutButton({
  onSignOut,
  className,
  showIcon = false,
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(showIcon && "justify-start gap-3", className)}
      onClick={onSignOut}
    >
      {showIcon && <LogOut aria-hidden="true" className="h-5 w-5" />}
      <span>Salir</span>
    </Button>
  );
}
