import { Lightbulb, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LESSONS_LEARNED, PLAYBOOKS, type LessonLearned } from "@/lib/mock/oncall";
import { formatRelative } from "@/lib/mock/time";

function LessonCard({ lesson }: { lesson: LessonLearned }) {
  const playbook = lesson.promotedToPlaybookId ? PLAYBOOKS.find((p) => p.id === lesson.promotedToPlaybookId) : null;

  return (
    <div className="flex flex-col gap-1.5 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-ink-em">{lesson.title}</p>
        <span className="shrink-0 text-2xs text-ink-faint">{formatRelative(lesson.timestamp)}</span>
      </div>
      <p className="text-xs leading-relaxed text-ink-muted">
        {lesson.whatHappened} {lesson.rootCause} {lesson.fix}
      </p>
      <div className="mt-1 flex items-start gap-1.5 rounded-md border border-agent-500/15 bg-agent-500/[0.04] px-2.5 py-2">
        <Lightbulb className="mt-0.5 size-3 shrink-0 text-agent-400" strokeWidth={2} />
        <p className="text-2xs leading-relaxed text-ink-muted">{lesson.gotcha}</p>
      </div>
      {playbook && (
        <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full border border-brand-500/25 bg-brand-500/10 px-2 py-0.5 text-2xs font-medium text-brand-400">
          <BookOpen className="size-2.5" strokeWidth={2} />
          Promoted to {playbook.name}
        </span>
      )}
    </div>
  );
}

export function LessonsLearned() {
  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-ink-em">Lessons Learned</h2>
      <p className="mt-1 text-xs text-ink-muted">
        An append-only note after every resolved incident — what happened, the root cause, the fix, and the one
        thing worth remembering next time.
      </p>

      <Card className="mt-4">
        <CardContent className="max-h-[640px] overflow-y-auto">
          {LESSONS_LEARNED.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
