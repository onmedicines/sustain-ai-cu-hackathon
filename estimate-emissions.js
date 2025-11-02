import { co2 } from "@tgwf/co2";

export async function estimateEmissions(totalBytes) {
  console.log("estimation start");

  const model = new co2({
    model: "swd",
    version: 4,
    rating: true, // a - f
  });

  const co2Estimate = model.perByteTrace(totalBytes);

  console.log("estimation end");
  return co2Estimate;
}
