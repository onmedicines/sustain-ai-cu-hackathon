import { co2 } from "@tgwf/co2";

export async function estimateEmissions(totalBytes) {
  const model = new co2({
    model: "swd",
    version: 4,
    rating: true, // a - f
  });

  const co2Estimate = model.perByteTrace(totalBytes);

  return co2Estimate;
}
