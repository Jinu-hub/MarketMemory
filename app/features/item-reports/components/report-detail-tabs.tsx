import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { CopyButton } from "~/core/components/copy-button";
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

import { useItemReportsUi } from "../i18n";
import { ReportMarkdown } from "../lib/markdown";
import { ShareSummaryBlock } from "./reading-layout";

type ReportDetailTabsProps = {
  content?: string | null;
  contentSns?: string | null;
  category?: string | null;
  isAdmin?: boolean;
};

type TabValue = "content" | "share";

function AdminCopyGuard({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(enabled && "select-none")}
      onCopy={enabled ? (e) => e.preventDefault() : undefined}
      onCut={enabled ? (e) => e.preventDefault() : undefined}
      onKeyDownCapture={
        enabled
          ? (e) => {
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
                e.preventDefault();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

export function ReportDetailTabs({
  content,
  contentSns,
  category,
  isAdmin = false,
}: ReportDetailTabsProps) {
  const ui = useItemReportsUi();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("content");

  const activeText = activeTab === "share" ? contentSns : content;
  const canCopy = isAdmin && Boolean(activeText);
  const briefingSuffix = contentSns ? ui.detailTabs.briefingSuffix : "";

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
            {open ? ui.detailTabs.collapse : ui.detailTabs.expand}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            {ui.detailTabs.subtitle.replace("{briefing}", briefingSuffix)}
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
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <div className="flex items-end justify-between gap-3">
              <TabsList variant="line" aria-label={ui.detailTabs.tabsAria}>
                <TabsTrigger value="content">{ui.detailTabs.reportTab}</TabsTrigger>
                {contentSns ? (
                  <TabsTrigger value="share">{ui.detailTabs.briefingTab}</TabsTrigger>
                ) : null}
              </TabsList>
              {canCopy ? (
                <CopyButton
                  text={activeText ?? ""}
                  label={ui.common.copy}
                  aria-label={ui.common.copyAdminOnly}
                  className="cursor-pointer"
                />
              ) : null}
            </div>
            <AdminCopyGuard enabled={canCopy}>
              <TabsContent
                value="content"
                aria-label={ui.detailTabs.bodyAria}
                className="space-y-4 pt-6"
              >
                <ReportMarkdown category={category}>{content}</ReportMarkdown>
              </TabsContent>
              {contentSns ? (
                <TabsContent value="share" className="pt-6">
                  <ShareSummaryBlock category={category} className="my-0">
                    {contentSns}
                  </ShareSummaryBlock>
                </TabsContent>
              ) : null}
            </AdminCopyGuard>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
