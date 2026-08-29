"use client";

import { useState } from "react";
import { Terminal, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CI_WEATHER_VARIANTS } from "@/lib/mock/oncall";

export function CiWeatherReport() {
  const [variantIndex, setVariantIndex] = useState(0);
  const [checkCount, setCheckCount] = useState(0);
  const [loading, setLoading] = useState(false);

  function handleCheck() {
    setLoading(true);
    setTimeout(() => {
      setVariantIndex((i) => (i + 1) % CI_WEATHER_VARIANTS.length);
      setCheckCount((c) => c + 1);
      setLoading(false);
    }, 550);
  }

  const report = CI_WEATHER_VARIANTS[variantIndex];

  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-ink-em">CI Weather Report</h2>
      <p className="mt-1 text-xs text-ink-muted">
        One continuously-current answer to &ldquo;is it safe to merge right now&rdquo; — retrievable on demand, not a
        feed you scroll to find.
      </p>

      <Card className="mt-4">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <Button onClick={handleCheck} disabled={loading}>
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Terminal className="size-3.5" />}
              Get current status
            </Button>
            <span className="text-2xs text-ink-faint">{checkCount > 0 ? "Checked just now" : "Not checked this session"}</span>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-heading text-sm font-semibold text-ink-em">{report.headline}</p>
            <div className="mt-2 flex flex-col gap-2">
              {report.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
