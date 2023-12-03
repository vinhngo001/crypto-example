const fs = require('fs');
const path = require('path');
// const ini = require('ini');
const https = require('https');
const { crawlSkipWords, crawlSkipSessionKeyWords, crawlSkipTimeKeywords, crawlSkipSubdomainKeyWords, relevantParameters, languagesRelated, crawlSkipFileSize } = require("./crawl-skip");
/**
 * 
 * @param {string} urlString 
 * @returns {<boolean> {true or false}}
 */
function detectSessionUrlTrap(urlString) {
    // Define a pattern to match session-related parameters in URLs
    const sessionPattern = new RegExp(`[\\?&](${crawlSkipSessionKeyWords.join('|')})=[a-zA-Z0-9]+`);
    // Check if the URL contains any session-related parameters
    if (sessionPattern.test(urlString)) {
        // This URL contains a session-related parameter, which could lead to the session URL trap
        return true; // Skip this URL
    }

    // If the URL doesn't match the session trap pattern, continue processing the URL
    return false;
}

/**
 * 
 * @param {string} urlString 
 * @returns { <boolean> {true or false}}
 */
function detectNeverEndingUrl(urlString, visitedUrls) {
    if (visitedUrls.has(urlString)) {
        // If this URL has been visited before, it's part of the trap
        return true;
    }

    // Add the URL to the set of visited URLs
    visitedUrls.add(urlString);

    // Define a maximum depth to prevent infinite crawling
    const maxDepth = 3; // You can adjust this value based on your needs

    const pathSegments = new URL(urlString).pathname.split('/').filter(Boolean);
    if (pathSegments.length >= maxDepth) {
        // If the URL depth exceeds the maximum allowed, consider it a trap
        return true;
    }

    // If not matching the never-ending URL trap, continue processing the URL
    return false;
}

/**
 * 
 * @param {string} urlString
 * @returns {<boolean> {true or false}}
 */
function detectTimeTrap(urlString) {
    // Define a pattern to match URLs with flexible protocols (http or https)
    const pattern = new RegExp(`https?://(www\\.)?[^/]+/(${crawlSkipTimeKeywords.join('|')})/(\\d{4})/(\\d{2})`);

    const match = urlString.match(pattern);
    if (match) {
        const year = parseInt(match[3]);
        // const month = parseInt(match[4]);

        // Set a threshold for how far into the future is acceptable (e.g., 5 years)
        const futureThreshold = new Date().getFullYear() + 5;
        if (year > futureThreshold) {
            // This URL is too far into the future, skip it
            return true;
        }
    }

    // If not matching the time trap or within the acceptable future range, continue processing the URL
    return false;
}

/**
 * 
 * @param {any} page 
 * @param {string} url
 * @returns {<boolean> {true or false}}
 */
async function detectHttpsSubdomainInTrap(page, url) {
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    });

    const currentUrl = page.url();
    if (currentUrl !== url) {
        console.log("Redirect detected. Possibly HTTPS / subdomain trap.");
        return true;
    }

    const isHttpsUpgrade = currentUrl.startsWith('https://') && url.startsWith('http://');
    if (!isHttpsUpgrade) {
        const subdomainRegex = /^(https?:\/\/)?([a-z0-9-]+)\./i;
        const match = currentUrl.match(subdomainRegex);
        return match && match[2] !== "www";
        // // if (match && crawlSkipSubdomainKeyWords.some(word => match[2] === word)) {
        // //     return true;
        // // }

        // Create a regular expression pattern to match any subdomain
        // const subdomainPattern = new RegExp(`^https:\/\/(?:${crawlSkipSubdomainKeyWords.join("|")})\\..+`);
        // if (subdomainPattern.test(urlString)) {
        //     return true;
        // }
    }

    return false;
}

/**
 * 
 * @param {any} page 
 * @param {string} urlString 
 * @returns {<boolean> {true or false}}
 */
async function detectInfiniteRedirectTrap(page, urlString) {
    // const maxRedirects = 10; // Set an approriate limit.
    // const responseChain = [];
    // await page.on('response', (response) => {
    //     responseChain.push(response.url());
    // });

    // await page.goto(urlString, {
    //     waitUntil: 'domcontentloaded'
    // });

    // if (responseChain.length >= maxRedirects) {
    //     console.log("Infinite redirect trap detected.");
    //     return true;
    // }

    try {
        const response = await fetchData(urlString);
        if (response?.statusCode === 310 || response?.status === 310) {
            return false;
        }

        return false;
    } catch (error) {
        console.log("Redirect Loop");
        return true;
    }
}

/**
 * 
 * @param {string} url1 
 * @param {string} url2 
 * @returns {<boolean> {true or false}}
 */
async function detectDuplicateContent(url1, url2) {
    const response1 = await fetchData(url1);
    const response2 = await fetchData(url2);

    const body1 = await readResponse(response1);
    const body2 = await readResponse(response2);

    if (body1 === body2) {
        return true;
    } else {
        const innerBodyRegex = /<body[^<]+>(.+)<\/body>/i;
        const page1InnerBody = body1.replace(/\r\n/g, '').match(innerBodyRegex);
        const page2InnerBody = body2.replace(/\r\n/g, '').match(innerBodyRegex);
        if (page1InnerBody && page2InnerBody && page1InnerBody[1] === page2InnerBody[1]) {
            return true;
        }
    }

    return false;
}

/**
 * 
 * @param { string } url 
 * @return {<Promise>{any}}
 */
async function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            resolve(response);
        }).on("error", (error) => {
            reject(error);
        });
    });
}

/**
 * 
 * @param { any } response 
 * @return {<Promise>{any}}
 */
function readResponse(response) {
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

/**
 * 
 * @param {string} urlString 
 * @returns {<boolean> {true or false}}
 */
async function shouldSkipUrls(urlString) {
    const filterSkipWords = crawlSkipWords.filter(word => urlString.toLowerCase().includes(word));
    // console.log({ filterSkipWords });
    if (filterSkipWords && filterSkipWords.length > 0) {
        return true;
    }

    const skipTimeTrap = detectTimeTrap(urlString);
    if (skipTimeTrap) {
        return true;
    }

    const skipSessionTrap = detectSessionUrlTrap(urlString);
    if (skipSessionTrap) {
        return true;
    }
    
    const skipInfiniteRedirect = await detectInfiniteRedirectTrap(null, urlString);
    if (skipInfiniteRedirect) {
        return true;
    }

    // const itemUrl = new URL(urlString).origin;
    // const siteExist = (
    //     await sqlHelper.findOneAsync({
    //         db_name: visitedDb,
    //         table: visitedTable,
    //         find: {
    //             url: itemUrl,
    //         },
    //     })).row;

    // if (siteExist) {
    //     const isDuplicateContent = await detectDuplicateContent(siteExist.url, urlString);
    //     if (isDuplicateContent) {
    //         console.log("Page bodies by inner body test are the same");
    //         return true;
    //     }
    // }

    // Default: don't skip
    return false;
}

/**
 * 
 * @param {any} page 
 * @param {string} urlString 
 * @returns {<boolean> {true or false}}
 */
async function shouldSkipContent(page, urlString) {
    try {
        const pageContent = await page.goto(urlString, 'domcontentloaded');

        // Check if any of the unnessaccery Words appear in the page content
        const foundSkipWords = crawlSkipWords.filter(word => new RegExp(word, 'i').test(pageContent));
        if (foundSkipWords.length > 0) {
            return true;
        }

        // Detect and close a pop-up login form if it exists
        const formSelector = "form";
        await page.waitForSelector(formSelector);
        const formElm = await page.$('form');

        if (formElm) {
            const closeButton = await formElm.$('button');
            const buttonText = await formElm.evaluate(button => button.textContent.toLowerCase(), closeButton);
            if (buttonText.includes('close') ||
                buttonText.includes('clear') ||
                buttonText.includes('decline') ||
                buttonText.includes('detect') ||
                buttonText.includes('x')) {
                await closeButton.click();
            } else {
                await page.evaluate(formElm => {
                    formElm.style.display = 'none';
                }, formElm);
            }

            await page.waitForSelector(formSelector, { hidden: true, timeout: 5000 }).catch(() => {
                console.log('Form closed.');
            });
        }

        // Check if there is any content displayed
        const content = await page.evaluate(() => {
            return document.body.textContent;
        });

        if (content.trim()) {
            return false;
        }

        // check login - register page
        const loginElems = await page.$$('input[type="text"], input[type="password"]');

        const registerElms = await page.$('a:icontains("register"), a:icontains("sign-up")');

        if (loginElems.length > 0 || registerElms) return true;

        // Default: don't skip
        return false;
    } catch (error) {
        // await page.close();
        return false;
    }
}

/**
 * 
 * @description
 * Convert the scheme (e.g., http, https) and host to lowercase, as they are case-insensitive.
 * Ignore port numbers if they are default for the scheme (e.g., 80 for HTTP, 443 for HTTPS).
 * Remove trailing slashes, as URLs with or without a trailing slash usually point to the same resource. Additionally, resolve directory changes such as . or ...
 * @param {string} url 
 * @returns {string}
 */
function normalizeURL(url) {
    // Step 1: Normalize Scheme and Host
    const urlObject = new URL(url);
    urlObject.protocol = urlObject.protocol.toLowerCase();
    urlObject.host = urlObject.host.toLowerCase();

    // Step 2: Ignore Default Ports
    if (
        (urlObject.protocol === "http:" && urlObject.port === "80") ||
        (urlObject.protocol === "https:" && urlObject.port === "443")
    ) {
        urlObject.port = "";
    }

    // Step 3: Normalize Path
    const path = urlObject.pathname.replace(/\/$/, ""); // Remove trailing slashes
    const pathParts = path.split('/').filter(part => part !== '.'); // Resolve directory changes
    urlObject.pathname = pathParts.join('/');
    return urlObject.href;
}

/**
 * @description 
 * If definition of "the same" means that order doesn't matter, then sort the parameters. 
 * If it does, keep them as is.
 * @param {string} url 
 * @param {array} relevantParameters 
 * @returns {<string> {url}}
 */
function normalizeQueryParameters(url, relevantParameters) {
    // Step 5: Handle Query Parameters
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);

    // Step 4 Filter and sort only the relevant query parameters
    const filteredParams = [...params.entries()]
        .filter(([param, _]) => relevantParameters.includes(param))
        .sort((a, b) => a[0].localeCompare(b[0]));

    const sortedSearch = new URLSearchParams(filteredParams).toString();

    return urlObject.origin + urlObject.pathname + '?' + sortedSearch;
}

/**
 * @description
 * For each parameter, consider whether the parameter is relevant to the identity of the resource. 
 * For example, tracking parameters like utm_source or session IDs usually do not define a unique resource. 
 * Choose to remove such parameters or keep them based on the context.
 * @param {string} url1 
 * @param {string} url2 
 * @param {array} relevantParameters 
 * @returns {<boolean> {true or false}}
 */
function areURLsSimilar(url1, url2, relevantParameters) {
    // Normalize both URLs
    const normalizedURL1 = normalizeURL(url1);
    const normalizedURL2 = normalizeURL(url2);

    // Step 6: Canonicalize Query Parameters
    const canonicalURL1 = normalizeQueryParameters(normalizedURL1, relevantParameters);
    const canonicalURL2 = normalizeQueryParameters(normalizedURL2, relevantParameters);

    // Step 7: Percent-Encoding
    const percentEncodedURL1 = percentEncode(canonicalURL1);
    const percentEncodedURL2 = percentEncode(canonicalURL2);

    // Step 8: Comparison
    return percentEncodedURL1 === percentEncodedURL2;
}

function percentEncode(url) {
    // Split the URL into parts before and after the '?'
    const [baseURL, queryString] = url.split('?');

    // Encode the query string
    const encodedQueryString = encodeURIComponent(queryString);

    // Reconstruct the URL
    return baseURL + (encodedQueryString ? `?${encodedQueryString}` : '');
}

function filterSimilarURLs(list_url, inputUrl) {
    return list_url.filter((url) => areURLsSimilar(inputUrl, url, relevantParameters));
}

async function performOCR(url) {
    const result = await tesseract.recognize(url, languagesRelated);
    // const { data: { text } } = result;
    // console.log('OCR Result:', text);
    return result;
}

async function isImageOrWebsite(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await new Promise((resolve, reject) => {
                https.request(url, { method: "HEAD" }, (response) => {
                    resolve(response);
                }).on('error', (error) => {
                    reject(error);
                }).end();
            });

            const contentType = resp.headers['content-type'];
            if (contentType) {
                if (contentType.includes('text/html')) {
                    console.log(`${url} is a website`);
                    return resolve(false);
                }
                console.log(`${url} is a file with content type: ${contentType}`);
                const contentLength = response.headers['content-length'];

                if (contentLength) {
                    const fileSizeBytes = parseInt(contentLength);
                    const fileSizeMB = fileSizeBytes / (1024 * 1024);
                    console.log(`File size: ${fileSizeBytes} bytes (${fileSizeMB} MB)`);

                    if (fileSizeMB < 1) {
                        const result = await performOCR(url);
                        const { data: { text } } = result;
                        if (text.length < 50) {
                            return resolve(true);
                        }
                    }
                }
            }

            // Default don't skip
            return resolve(false);
        } catch (error) {
            // throw error;
            console.error(`Error while checking ${url}: ${error.message}`);
            reject(error);
        }
    });
}

module.exports = {
    shouldSkipUrls,
    shouldSkipContent,
    filterSimilarURLs
}