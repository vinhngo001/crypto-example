const puppeteer = require("puppeteer-core");
const fs = require("fs");
const { shouldSkipUrls } = require("./crawl-util");

// Function to recursively crawl a website
async function crawlPages(url) {
    console.log({ url })
    try {
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({
            args: ['--no-sandbox',],
            headless: true,
            ignoreHTTPSErrors: true,
            executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        });
        const page = await browser.newPage();

        // Visit the specified URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

        let currentPage = 1;
        const allPagesData = []; // Array to store all links
        while (true) {
            // Extract data from the current page here
            const linksOnCurrentPage = await page.evaluate(() => {
                const anchorElements = Array.from(document.querySelectorAll('a'));
                return anchorElements.map(anchor => anchor.href);
            });

            // Use shouldSkipUrls function to filter unnecessary URLs
            // const filteredLinks = linksOnCurrentPage.filter(url => !shouldSkipUrls(url));

            allPagesData.push({
                page: currentPage,
                links: linksOnCurrentPage,
            });

            // Click on the next page if available
            const nextPageElement = await findNextPageElement(page);
            if (nextPageElement) {
                // await nextPageElement.click();
                await nextPageElement.evaluate(b => b.click());
                // Wait for navigation or content loading if necessary
                await page.waitForNavigation();
                currentPage++;
            } else {
                // No more pages, break the loop
                console.log("Next button not found");
                break;
            }
        }

        // console.log({ allPagesData });
        // Save all links to a file
        fs.writeFileSync('crawledData.json', JSON.stringify(allPagesData, null, 2));

        await browser.close();
    } catch (error) {
        console.log(error);
    }
}

// Start crawling with a specified URL and depth

async function findNextPageElement(page) {
    // Implement logic to find the next page element dynamically
    // For example, you can look for elements with text like 'Next', 'More', etc.
    // const nextPageElement = await page.$x("//button[contains(., 'Next')]");
    // const nextButtonXPath = `
    //     (//a[contains(@href, 'page') or contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1] |
    //     (//button[contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1] |
    //     (//input[@type='button' or @type='submit'][contains(@value, 'next') or contains(@value, '>') or contains(@value, 'Next Page') or contains(@value, 'Continue')])[1]
    // `;
    const nextButtonXPath = `
    (//a[contains(@href, 'page') or contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1] |
    (//*[self::button or (self::input[@type='button' or @type='submit'])][contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1]
  `;


    // const nextPageElement = await page.$x(".//a[contains(@href, 'page') or contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue') or (self::button or self::input[@type='button' or @type='submit'])]");
    const nextPageElement = await page.$x(nextButtonXPath);

    if (!nextPageElement || nextPageElement.length === 0) {
        // If no button is found, try searching for other elements
        // For example, you can use different XPath expressions or other queries
        return null;
    }

    return nextPageElement[0]; // Return the first matching element
}

// Example usage
const targetUrl = 'https://www.pdr.net/browse-by-drug-name?search=$1'.replace("$1", "Aspirin");
crawlPages(targetUrl);
