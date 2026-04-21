/**
 * Markdown renderer wrapper that applies Market Memory typography tokens.
 *
 * `item_contents.content` is stored as plain Markdown in the database.
 * We use `react-markdown` + `remark-gfm` so reports render with tables,
 * strikethrough, task lists, and autolinked URLs, styled consistently with
 * the MDX blog typography.
 */
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "~/core/lib/utils";

type ReportMarkdownProps = {
  children?: string | null;
  className?: string;
};

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mt-10 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0 md:text-4xl"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="border-border mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 md:text-3xl"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight md:text-2xl"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-6 scroll-m-20 text-lg font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p
      className="text-foreground/90 leading-8 [&:not(:first-child)]:mt-5"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-5 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-5 ml-6 list-decimal [&>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-border text-muted-foreground my-6 border-l-2 pl-6 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-primary hover:text-primary/80 underline underline-offset-4"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={cn("font-mono text-sm", className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="bg-muted my-6 overflow-x-auto rounded-lg border p-4 text-sm leading-6"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: (props) => <hr className="border-border my-10" {...props} />,
  table: ({ children, ...props }) => (
    <div className="my-6 w-full overflow-x-auto">
      <table
        className="border-border w-full border-collapse border text-sm"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-border bg-muted/50 border px-3 py-2 text-left font-semibold"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-border border px-3 py-2 align-top" {...props}>
      {children}
    </td>
  ),
  img: ({ alt, ...props }) => (
    <img
      alt={alt ?? ""}
      className="border-border my-6 rounded-lg border"
      {...props}
    />
  ),
};

export function ReportMarkdown({ children, className }: ReportMarkdownProps) {
  if (!children) return null;
  return (
    <div className={cn("max-w-none text-base md:text-[1.05rem]", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
