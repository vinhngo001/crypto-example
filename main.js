const puppeteer = require("puppeteer-core");
const fs = require("fs");
const { shouldSkipUrls } = require("./crawl-util");
const fetch = require("node-fetch");
const { URL, resolve } = require("url");
const RobotsParser = require('robots-parser');
const https = require("https");

// Function to recursively crawl a website
async function crawlPages(url) {
    console.log({ url })
    try {
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({
            args: ['--no-sandbox',],
            headless: true,
            ignoreHTTPSErrors: true,
            // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        });
        const page = await browser.newPage();

        // Visit the specified URL
        await page.goto(url, { waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'], timeout: 20000 });

        let currentPage = 1;
        const allPagesData = []; // Array to store all links
        while (true) {
            // Extract data from the current page here
            // const linksOnCurrentPage = await page.evaluate(() => {
            //     const anchorElements = Array.from(document.querySelectorAll('a'));
            //     return anchorElements.map(anchor => anchor.href);
            // });
            const linksOnCurrentPage = await extractLinks(page);
            allPagesData.push({
                page: currentPage,
                links: linksOnCurrentPage,
            });

            fs.writeFileSync('crawledData.json', JSON.stringify(allPagesData, null, 2));
            // Click on the next page if available
            // const nextPageElement = await findNextPageElement(page);
            const nextPageElement = await page.$('button[data-action="next"], a[data-action="next"], input[type="submit"][data-action="next"], span[data-action="next"]');
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

        await browser.close();
    } catch (error) {
        console.log(error);
    }
}

async function extractLinks(page,) {
    let urls = [];
    // Modify this part to match the actual structure of the website
    const linkElements = await page.$$('a[href]');

    for (const linkElement of linkElements) {
        const link = await page.evaluate(el => el.getAttribute('href'), linkElement);
        // console.log('Link:', link);
        urls.push(link)
        // You can save the link to a file, database, or perform other actions here
    }

    return urls;
}

async function findNextPageElement(page) {
    // Implement logic to find the next page element dynamically
    // For example, you can look for elements with text like 'Next', 'More', etc.
    // const nextPageElement = await page.$x("//button[contains(., 'Next')]");
    // const nextPageSelector = `
    //     (//a[contains(@href, 'page') or contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1] |
    //     (//button[contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1] |
    //     (//input[@type='button' or @type='submit'][contains(@value, 'next') or contains(@value, '>') or contains(@value, 'Next Page') or contains(@value, 'Continue')])[1]
    // `;
    //     const nextPageSelector = `
    //     (//a[contains(@href, 'page') or contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1] |
    //     (//*[self::button or (self::input[@type='button' or @type='submit'])][contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue')])[1]
    //   `;
    // const nextPageElement = await page.$x(".//a[contains(@href, 'page') or contains(text(), 'next') or contains(text(), '>') or contains(text(), 'Next Page') or contains(text(), 'Continue') or (self::button or self::input[@type='button' or @type='submit'])]");
    // const nextPageSelector = `//a[contains(@class, 'next') or contains(@class, 'pagination-next') or contains(text(), 'Next')]`;
    // const nextPageSelector = `
    //     //a[contains(@href, 'next') or contains(text(), 'next') or contains(text(), 'More') or contains(text(), 'Continue') or contains(text(), '>')] |
    //     //button[contains(text(), 'next') or contains(text(), 'More') or contains(text(), 'Continue') or contains(text(), '>')] |
    //     //input[@type='submit' and (contains(@value, 'next') or contains(@value, 'Continue'))],
    // `;
    
    // const nextPageButton = (await page.$x(nextPageSelector))[0];
    // if (!nextPageButton) {
    //     return null;
    // }

    // return nextPageButton;

    const possibleNextPageSelectors = [
        '//a[contains(@href, "next") or contains(text(), "next") or contains(text(), "More") or contains(text(), "Continue")]',
        '//button[contains(text(), "next") or contains(text(), "More") or contains(text(), "Continue")]',
        '//input[@type="submit" and contains(@value, "next")]',
        '//span[contains(text(), "next") or contains(text(), "More") or contains(text(), "Continue")]', 
        // Add more possible selectors based on observed patterns
    ];

    for (const selector of possibleNextPageSelectors) {
        const nextPageButton = await page.$x(selector);
        if (nextPageButton.length > 0) {
            return nextPageButton[0];
        }
    }

    return null; // If no match is found
}

// Example usage
const targetUrl = 'https://www.pdr.net/browse-by-drug-name?search=$1'.replace("$1", "Aspirin");
crawlPages(targetUrl);

async function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            resolve(response);
        }).on("error", (error) => {
            reject(error);
        });
    });
}

async function readResponse(response) {
    return new Promise((resolve, reject) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            resolve(data);
        });

        response.on("error", (error) => {
            reject(error);
        });
    });
}

// async function getContent(url) {
//     const response = await fetchData(url);
//     const body = await readResponse(response);

//     return fs.writeFileSync('crawledData.json', JSON.stringify(body, null, 2));
// }

async function getContent(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',],
        headless: true,
        ignoreHTTPSErrors: true,
        // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Capture the initial HTML
    const initialHTML = await page.content();

    // Wait for additional content loaded by API
    await page.waitForTimeout(3000); // Adjust the wait time as needed

    // Capture the final state of the page
    const finalHTML = await page.content();

    // Save the initial and final HTML to separate files
    fs.writeFileSync('initialHTML.json', JSON.stringify(initialHTML, null, 2));
    fs.writeFileSync('finalHTML.json', JSON.stringify(finalHTML, null, 2));

    // Close the browser
    await browser.close();
}


getContent("https://mohap.gov.ae/en/search?keywords=virus");