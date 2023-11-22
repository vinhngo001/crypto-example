const fs = require('fs');
const { Cluster } = require('puppeteer-cluster');

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  const results = [];

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract all href links from the page
    const hrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(link => link.href);
    });

    // Add results to the array
    results.push({ url, hrefs });
  });

  // Add URLs to the queue
  const urls = [
    'https://mohap.gov.ae/en/search?keywords=drug',
    'https://www.ecetoc.org/?s=virus'
    // "https://www.amazon.com/s?k=amazonbasics&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=EQNRr&pd_rd_wg=PygJX&pf_rd_p=9349ffb9-3aaa-476f-8532-6a4a5c3da3e7&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
    // "https://www.amazon.com/s?k=oculus&i=electronics-intl-ship&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=iMBhG&pd_rd_wg=PygJX&pf_rd_p=5c71b8eb-e4c7-4ea1-bf40-b57ee72e089f&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
  ];
  for (const url of urls) {
    cluster.queue(url);
  }

  // Wait for all tasks to complete
  await cluster.idle();
  await cluster.close();

  // Save results to a JSON file using fs
  const jsonResults = JSON.stringify(results, null, 2);
  fs.writeFileSync('results.json', jsonResults);
})();
