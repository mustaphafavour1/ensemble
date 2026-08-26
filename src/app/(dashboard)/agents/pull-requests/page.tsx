import { GitPullRequest } from "lucide-react";
import { SectionPreview } from "@/components/section-preview";

export default function PullRequestsDiffsPage() {
  return (
    <SectionPreview
      icon={GitPullRequest}
      title="Pull Requests / Diffs"
      description="Every open pull request authored by an agent, across every repo, in one review queue."
      bullets={[
    "Cross-repo view of every agent-authored PR",
    "Review status and required approvals at a glance",
    "Links back to the originating run and its full diff",
      ]}
    />
  );
}
