import type { ComponentProps, HTMLAttributes } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex min-w-0 w-full items-end justify-end gap-2 py-2",
      from === "user"
        ? "is-user"
        : "is-assistant flex-row-reverse justify-end",
      "[&>div]:min-w-0 [&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "min-w-0 max-w-full overflow-hidden break-words",
      "flex flex-col gap-2 rounded-lg border border-border px-3 py-2 text-sm",
      "bg-background text-foreground",
      "group-[.is-user]:border-transparent group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <div className="min-w-0 max-w-full">
      {children}
    </div>
  </div>
);

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);