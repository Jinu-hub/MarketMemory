/**
 * Markdown renderer wrapper that applies Market Memory typography tokens.
 *
 * `item_contents.content` is stored as plain Markdown in the database.
 * We use `react-markdown` + `remark-gfm` so reports render with tables,
 * strikethrough, task lists, and autolinked URLs, styled consistently with
 * the MDX blog typography.
 *
 * Editorial flourishes (so the report tab feels closer to a published
 * piece than a generic markdown dump):
 *   - the body sits on a subtle "paper" surface (card-tinted background,
 *     soft border, generous padding) to read as an open page rather than
 *     a markdown dump — pairs especially well with the warm theme
 *   - the first paragraph reads as a lead (larger size, looser leading,
 *     stronger weight) to act as a stand-first / dek
 *   - `---` horizontal rules render as a centred ornament divider tinted
 *     with the report's category accent
 *   - `>` blockquotes upgrade to a pull-quote with category accent border
 *     and a soft Quote glyph, mirroring `ReadingPullQuote`
 */
import { QuoteIcon } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "./category-style";

type ReportMarkdownProps = {
  children?: string | null;
  category?: string | null;
  className?: string;
};

const baseComponents: Components = {
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

export function ReportMarkdown({
  children,
  category,
  className,
}: ReportMarkdownProps) {
  if (!children) return null;
  const style = getCategoryStyle(category);
  const CategoryIcon = style.icon;

  const components: Components = {
    ...baseComponents,
    hr: () => (
      <div
        role="separator"
        aria-hidden
        className="my-12 flex items-center gap-4"
      >
        <span className="bg-border/60 h-px flex-1" />
        <CategoryIcon
          className={cn("size-3.5 opacity-70", style.accentText)}
        />
        <span className="bg-border/60 h-px flex-1" />
      </div>
    ),
    blockquote: ({ children: quoteChildren, ...props }) => (
      <blockquote
        className={cn(
          "relative my-8 border-l-[3px] py-4 pr-2 pl-7",
          style.accentBorder,
          // Pull-quote treatment for the inner paragraph(s).
          "[&>p]:text-foreground/90 [&>p]:text-lg [&>p]:leading-relaxed [&>p]:font-medium [&>p]:italic",
          "[&>p:not(:first-child)]:mt-3",
        )}
        {...props}
      >
        <QuoteIcon
          aria-hidden
          className={cn(
            "absolute -top-2 -left-3 size-6 opacity-25",
            style.accentText,
          )}
        />
        {quoteChildren}
      </blockquote>
    ),
  };

  return (
    <div
      className={cn(
        "max-w-none text-base md:text-[1.05rem]",
        // Paper container — subtle elevated reading surface that pairs
        // with the briefing card as a visual sibling without competing
        // with it (no category accent here; the body's lead/divider/
        // pull-quote treatments already carry the category language).
        "bg-card/40 border-border/40 rounded-xl border",
        "px-5 py-7 md:px-10 md:py-12",
        // Lead paragraph treatment — first top-level <p> reads as a dek.
        "[&>p:first-of-type]:text-foreground [&>p:first-of-type]:text-lg [&>p:first-of-type]:font-medium [&>p:first-of-type]:leading-9",
        "md:[&>p:first-of-type]:text-xl md:[&>p:first-of-type]:leading-10",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
