"use client";

import type { HTMLAttributes } from "react";
import { memo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@workspace/ui/lib/utils";

export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
};

const components: Options["components"] = {
   table: ({ children, className, ...props }) => (
    <div className="my-3 w-full max-w-full overflow-x-auto rounded-md border border-border">
      <table
        className={cn(
          "w-full min-w-[600px] border-collapse text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  ),

  thead: ({ children, className, ...props }) => (
    <thead
      className={cn("bg-muted/50", className)}
      {...props}
    >
      {children}
    </thead>
  ),

  th: ({ children, className, ...props }) => (
    <th
      className={cn(
        "border-b border-border px-3 py-2 text-left font-semibold whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, className, ...props }) => (
    <td
      className={cn(
        "border-b border-border px-3 py-2 align-top",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  ),

  p: ({ children, className, ...props }) => (
    <p
      className={cn("my-2 leading-6", className)}
      {...props}
    >
      {children}
    </p>
  ),

  ol: ({ children, className, ...props }) => (
    <ol
      className={cn("ml-5 list-outside list-decimal", className)}
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, className, ...props }) => (
    <li className={cn("py-1", className)} {...props}>
      {children}
    </li>
  ),

  ul: ({ children, className, ...props }) => (
    <ul
      className={cn("ml-5 list-outside list-disc", className)}
      {...props}
    >
      {children}
    </ul>
  ),

  strong: ({ children, className, ...props }) => (
    <strong
      className={cn("font-semibold", className)}
      {...props}
    >
      {children}
    </strong>
  ),

  a: ({ children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),

  h1: ({ children, className, ...props }) => (
    <h1
      className={cn("mt-6 mb-2 text-3xl font-semibold", className)}
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, className, ...props }) => (
    <h2
      className={cn("mt-6 mb-2 text-2xl font-semibold", className)}
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, className, ...props }) => (
    <h3
      className={cn("mt-6 mb-2 text-xl font-semibold", className)}
      {...props}
    >
      {children}
    </h3>
  ),

  h4: ({ children, className, ...props }) => (
    <h4
      className={cn("mt-6 mb-2 text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </h4>
  ),

  h5: ({ children, className, ...props }) => (
    <h5
      className={cn("mt-6 mb-2 text-base font-semibold", className)}
      {...props}
    >
      {children}
    </h5>
  ),

  h6: ({ children, className, ...props }) => (
    <h6
      className={cn("mt-6 mb-2 text-sm font-semibold", className)}
      {...props}
    >
      {children}
    </h6>
  ),
};

export const AIResponse = memo(
  ({ className, options, children, ...props }: AIResponseProps) => (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden break-words",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "[&_img]:max-w-full",
        "[&_pre]:max-w-full [&_pre]:overflow-x-auto",
        className,
      )}
      {...props}
    >
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        skipHtml
        {...options}
      >
        {children}
      </ReactMarkdown>
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

AIResponse.displayName = "AIResponse";