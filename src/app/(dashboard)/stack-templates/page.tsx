"use client";

import Link from "next/link";
import { Boxes, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { useAppStore } from "@/lib/store";
import { usePagination } from "@/lib/use-pagination";
import { STACK_TEMPLATES, STACKS } from "@/lib/mock/catalog";

const PAGE_SIZE = 8;

export default function StackTemplatesPage() {
  const seeded = useAppStore((s) => s.seeded);
  const templates = seeded ? STACK_TEMPLATES : [];
  const { page, setPage, pageCount, pageItems } = usePagination(templates, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Stack Templates"
        description="Pre-configured, ready-to-spin-up environments — the same fleet of agents works across every one."
      />

      {!seeded ? (
        <EmptyState
          icon={Boxes}
          title="No templates yet"
          description="Turn on demo data in Settings to see the template gallery."
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {pageItems.map((tpl) => {
              const stack = STACKS[tpl.stackId];
              return (
                <Card key={tpl.id} className="transition-colors hover:border-neutral-700">
                  <CardContent className="flex h-full flex-col">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: stack.color }}
                      />
                      <p className="font-mono text-sm text-ink-100">{stack.language}</p>
                    </div>
                    <p className="mt-0.5 text-2xs text-ink-500">{stack.framework}</p>
                    <p className="mt-3 flex-1 text-2xs leading-relaxed text-ink-300">
                      {tpl.tagline}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <p className="text-2xs text-ink-500">
                        <span className="font-mono text-ink-300 tabular-nums">
                          {tpl.usageCount}
                        </span>{" "}
                        environments spun up
                      </p>
                      <Link
                        href="/environments/new"
                        className="flex items-center gap-1 text-2xs font-medium text-brand-400 hover:underline"
                      >
                        Use template
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Pagination
            page={page}
            pageCount={pageCount}
            total={templates.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
