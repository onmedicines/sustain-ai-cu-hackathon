import calculateMetrics from "./calculate-metrics.js";
import { estimateEmissions } from "./estimate-emissions.js";

export async function analyzeWebsite(url) {
  console.log("analyzing webiste");

  if (!url) {
    throw new Error("URL is required.");
  }

  const metrics = await calculateMetrics(url);
  const totalBytes = metrics.resources?.totalTransferSize || 0;

  const emissions = await estimateEmissions(totalBytes);

  console.log("analysis done");
  return {
    url,
    metrics,
    totalTransferBytes: totalBytes,
    emissions,
  };
}

// Optional: Allow CLI usage (node index.js <url>)
if (process.argv[1].includes("main.js") && process.argv[2]) {
  const url = process.argv[2];
  analyzeWebsite(url)
    .then((result) => {
      console.log("=== 🌍 Carbon Footprint Estimate ===");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("❌ Error:", err);
    });
}
