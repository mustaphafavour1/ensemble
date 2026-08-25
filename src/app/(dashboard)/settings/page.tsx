import { Boxes } from "lucide-react";
import { Centered } from "@/components/centered";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoleSwitcher } from "@/components/settings/role-switcher";
import { SeedToggle } from "@/components/settings/seed-toggle";

export default function SettingsPage() {
  return (
    <Centered className="min-h-[calc(100dvh-var(--header-height)-var(--content-offset)-4rem)] items-start pt-2">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="font-mono text-2xl text-ink-100">Settings</h1>
          <p className="mt-1.5 text-xs text-ink-300">
            Workspace preferences for this Ensemble console.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md border border-border bg-surface text-brand-500">
                  <Boxes className="size-3.5" strokeWidth={1.75} />
                </div>
                <CardTitle>Workspace</CardTitle>
              </div>
              <CardDescription>
                General information about this organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 text-xs">
                <dt className="text-ink-300">Organization</dt>
                <dd className="text-right font-mono text-ink-100">
                  Ensemble Labs
                </dd>
                <dt className="text-ink-300">Plan</dt>
                <dd className="text-right font-mono text-ink-100">Team</dd>
                <dt className="text-ink-300">Region</dt>
                <dd className="text-right font-mono text-ink-100">
                  us-east-1
                </dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role</CardTitle>
              <CardDescription>
                Switches the console view in real time. All roles are listed
                — only Product Admin and Lead Developer are available in this
                preview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleSwitcher />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo data</CardTitle>
              <CardDescription>
                Controls the sample data shown across every page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeedToggle />
            </CardContent>
          </Card>
        </div>
      </div>
    </Centered>
  );
}
