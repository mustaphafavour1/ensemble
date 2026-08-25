/**
 * Nivo's `axisBottom.tickValues` needs an explicit array on point/band
 * scales — a plain count is ignored and every category renders as a tick,
 * which overlaps badly once there are more than ~10 of them.
 */
export function sparseTicks(labels: string[], maxTicks = 6): string[] {
  if (labels.length <= maxTicks) return labels;
  const step = Math.ceil(labels.length / maxTicks);
  const out: string[] = [];
  for (let i = 0; i < labels.length; i += step) out.push(labels[i]);
  const last = labels[labels.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}
