/**
 * Detail-screen disclosure block.
 *
 * Inspired by the `content-showcase` "Read Detailed Analysis" pattern, but
 * upgraded for production reading: a full-width disclosure trigger reveals
 * the heavyweight body — the markdown report (`리포트`) and SNS briefing
 * (`브리핑`) tabs — directly below it. Built on Radix `Collapsible` so the
 * height transition is smooth in both directions (no snap-close).
 *
 * UX details:
 *   - chevron rotates 180° instead of swapping icons (less visual noise)
 *   - the trigger is the entire row so the touch target is generous
 *   - a one-line subtitle clarifies what's behind the toggle
 *   - the bottom border of the article keeps the editorial rhythm whether
 *     the disclosure is open or closed
 */
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import { cn } from "~/core/lib/utils";

import { ReportMarkdown } from "../lib/markdown";
import { ShareSummaryBlock } from "./reading-layout";

type ReportDetailTabsProps = {
  content?: string | null;
  contentSns?: string | null;
  category?: string | null;
};

export function ReportDetailTabs({
  content,
  contentSns,
  category,
}: ReportDetailTabsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-border/60 border-t"
    >
      <CollapsibleTrigger
        className={cn(
          "group hover:bg-muted/40 focus-visible:bg-muted/40",
          "-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-lg px-3 py-4 text-left",
          "transition-colors duration-200 outline-none",
        )}
      >
        <span
          className={cn(
            "border-border/70 bg-background flex size-9 shrink-0 items-center justify-center rounded-full border",
            "group-hover:border-primary/40 group-hover:text-primary transition-colors",
          )}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform duration-300 ease-out",
              open && "rotate-180",
            )}
          />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-foreground text-base font-semibold">
            {open ? "접기" : "자세히 보기"}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            리포트 본문{contentSns ? "과 SNS 브리핑" : ""} 살펴보기
          </span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "overflow-hidden",
          "data-[state=closed]:animate-collapsible-up",
          "data-[state=open]:animate-collapsible-down",
        )}
      >
        <div className="pt-2 pb-2">
          <Tabs defaultValue="content">
            <TabsList variant="line" aria-label="리포트 보기 모드">
              <TabsTrigger value="content">리포트</TabsTrigger>
              {contentSns ? (
                <TabsTrigger value="share">브리핑</TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent
              value="content"
              aria-label="본문"
              className="space-y-4 pt-6"
            >
              <ReportMarkdown>{content}</ReportMarkdown>
            </TabsContent>
            {contentSns ? (
              <TabsContent value="share" className="pt-6">
                <ShareSummaryBlock category={category} className="my-0">
                  {contentSns}
                </ShareSummaryBlock>
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
