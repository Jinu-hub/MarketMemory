import "dotenv/config";

import { runMarketSignalPipeline } from "../app/features/cron/lib/market-signal/pipeline.server";

const dryRun = process.argv.includes("--dry-run");
const weeklyOnly = process.argv.includes("--weekly-only");
const monthlyOnly = process.argv.includes("--monthly-only");
const yearlyOnly = process.argv.includes("--yearly-only");
const discover = process.argv.includes("--discover");

const periodTypes = weeklyOnly
  ? (["weekly"] as const)
  : monthlyOnly
    ? (["monthly"] as const)
    : yearlyOnly
      ? (["yearly"] as const)
      : discover
        ? (["weekly"] as const)
        : (["weekly", "monthly", "yearly"] as const);

async function main() {
  const result = await runMarketSignalPipeline({
    mode: discover ? "discover_and_aggregate" : "backfill",
    dryRun,
    periodTypes: [...periodTypes],
    finalize: !discover,
  });

  console.log(
    JSON.stringify(
      {
        dryRun: result.dryRun,
        totalSources: result.totalSources,
        discoveredSources: result.discoveredSources,
        dateRange: result.dateRange,
        periodsProcessed: result.periodsProcessed.length,
        errors: result.errors,
        info: result.info,
        sample: result.periodsProcessed.slice(-3),
      },
      null,
      2,
    ),
  );

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
