import puppeteer from "puppeteer";

async function calculateMetrics(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ],
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (err) {
    console.warn(`Failed to fully load ${url}: ${err.message}`);
  }

  const metrics = await page.evaluate(() => {
    const data = {};

    const nav = performance.getEntriesByType("navigation")[0];
    if (nav) {
      data.navigation = {
        type: nav.type,
        startTime: nav.startTime,
        duration: nav.duration,
        dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
        tcpConnection: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        responseTime: nav.responseEnd - nav.responseStart,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        loadTime: nav.loadEventEnd - nav.startTime,
      };
    }

    const resources = performance.getEntriesByType("resource").map((r) => ({
      name: r.name,
      initiatorType: r.initiatorType,
      transferSize: r.transferSize,
      encodedBodySize: r.encodedBodySize,
      decodedBodySize: r.decodedBodySize,
      duration: r.duration,
      protocol: r.nextHopProtocol,
    }));

    data.resources = {
      totalResources: resources.length,
      totalTransferSize: resources.reduce((a, b) => a + b.transferSize, 0),
      totalEncodedSize: resources.reduce((a, b) => a + b.encodedBodySize, 0),
      totalDecodedSize: resources.reduce((a, b) => a + b.decodedBodySize, 0),
      byType: Object.fromEntries(
        Object.entries(
          resources.reduce((acc, r) => {
            acc[r.initiatorType] = (acc[r.initiatorType] || 0) + r.transferSize;
            return acc;
          }, {})
        ).map(([k, v]) => [k, (v / 1024).toFixed(2) + " KB"])
      ),
      details: resources,
    };

    const paints = performance.getEntriesByType("paint");
    data.paint = Object.fromEntries(
      paints.map((p) => [p.name, p.startTime.toFixed(2)])
    );

    if (performance.memory) {
      data.memory = {
        jsHeapUsed:
          (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
        jsHeapTotal:
          (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
      };
    }

    return data;
  });

  await browser.close();

  return metrics;
}

export default calculateMetrics;
