import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PLAYBOOKS, type Playbook } from "@/lib/mock/oncall";

function PlaybookCard({ playbook }: { playbook: Playbook }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] text-ink-em">{playbook.name}</p>
          <span className="shrink-0 text-2xs text-ink-faint tabular-nums">{playbook.usageCount}× used</span>
        </div>
        <p className="text-2xs text-ink-muted">{playbook.description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1.5">
          {playbook.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-1.5 text-2xs leading-relaxed text-ink-muted">
              <span className="mt-0.5 shrink-0 text-ink-faint tabular-nums">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
        <p className="border-t border-border pt-2.5 text-2xs leading-relaxed text-ink-faint">{playbook.originStory}</p>
      </CardContent>
    </Card>
  );
}

export function InvestigationPlaybooks() {
  return (
    <div>
      <p className="text-xs text-ink-muted">
        Recurring bug classes get generalized into a reusable procedure once the same pattern shows up more than
        once — this is the tier above an individual Lessons Learned entry.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {PLAYBOOKS.map((playbook) => (
          <PlaybookCard key={playbook.id} playbook={playbook} />
        ))}
      </div>
    </div>
  );
}
