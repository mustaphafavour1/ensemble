import { ModelHealthGauge } from "@/components/overview/model-health-gauge";
import { MODEL_VERSIONS } from "@/lib/mock/models";
import { getModelHealth } from "@/lib/mock/sla";

function formatRate(perSec: number): string {
  if (perSec >= 1000) return `${(perSec / 1000).toFixed(1)}K/s`;
  return `${perSec}/s`;
}

export function ModelHealthStrip() {
  const models = MODEL_VERSIONS.filter((m) => m.status !== "deprecated");

  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
      {models.map((model) => {
        const health = getModelHealth(model);
        return (
          <ModelHealthGauge
            key={model.id}
            name={model.name}
            version={`v${model.version}`}
            score={health.score}
            status={health.status}
            stats={[
              { label: "Latency", value: `${health.latencyMs.toLocaleString()}ms` },
              { label: "Requests/sec", value: formatRate(health.requestsPerSec) },
            ]}
          />
        );
      })}
    </div>
  );
}
