const puppeteer = require("puppeteer-core");

async function openBrowser() {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox',],
            headless: true,
            ignoreHTTPSErrors: true,
            executablePath: process.env.EXECUTABLE_PATH,
        });

        // Handle browser disconnection.
        browser.on('disconnected', () => {
            console.log('Browser disconnected.');
        });

        return browser;
    } catch (error) {
        console.log(error.message);
    }
}

async function scrapeUSAWebSearch() {
    // let browser, page = null;
    // browser = await openBrowser();
    // page = await browser.newPage();
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',],
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' //local,
    });
    try {
        const page = await browser.newPage();
        // Navigate to the URL
        await page.goto('https://search.usa.gov/search?affiliate=fda1&query=virus', { waitUntil: 'networkidle2', timeout: 20000 });

        // Function to extract page URLs
        async function extractPageUrls() {
            const pageUrls = [];
            const paginationLinks = await page.$$('.pagination-numbered-link');

            for (const link of paginationLinks) {
                const url = await page.evaluate(link => link.href, link);
                pageUrls.push(url);
            }

            return pageUrls;
        }

        // Get the initial page URLs
        let pageUrls = await extractPageUrls();

        // Check if there's a "Next" button and navigate through pages
        while (true) {
            const nextPageButton = await page.$('.next_page');
            if (!nextPageButton) {
                break; // No more pages
            }

            await nextPageButton.click();
            await page.waitForNavigation();

            // Extract URLs from the current page
            const pageUrlsOnCurrentPage = await extractPageUrls();
            pageUrls = pageUrls.concat(pageUrlsOnCurrentPage);
        }

        // Print all page URLs
        console.log('Page URLs:');
        console.log({ pageUrls });

        await browser.close();

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close the browser when done
        await browser.close();
    }
}

// Call the scraping function
scrapeUSAWebSearch();