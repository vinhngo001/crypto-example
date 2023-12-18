const puppeteer = require("puppeteer-core");
const fs = require('fs')
const { parse } = require('himalaya');
const { cleanData, cleanUpList } = require("../helpers");
const utils = require("../utils");
// const html = fs.readFileSync('../content/contentHtml.txt', { encoding: 'utf-8' });

// const json = parse(html);
// fs.writeFileSync('content/finalHTML.json', JSON.stringify(json, null, 2));

const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'abbr', 'acronym', 'address', 'bdo', 'blockquote', 'cite', 'q', 'code', 'ins', 'del', 'dfn', 'kbd', 'pre', 'samp', 'var', 'br', 'span'];
const linkTags = ["a", "base"];
const imageTags = ["img", "area", "map", "param", "object", "iframe"];
const listTags = ["ul", "ol", "li", "dl", "dt", "dd"];
const tableTags = ["table", "tr", "td", "th", "tbody", "thead", "tfoot", "col", "colgroup", "caption"];
const scripTags = ["script", "noscript"];
const formTags = ["form", "input", "textarea", "select", "option", "optgroup", "button", "label", "fieldset", "legend"];

const tagMappings = {
    ...createMapping(textTags, extractTextData),
    ...createMapping(linkTags, extractLinkData),
    ...createMapping(imageTags, extractImageData),
    // ...createMapping(formTags, extractFormData),
    // ...createMapping(scripTags, extractFormData),
    // ...createMapping(listTags, extractListData),
    // tableTags: { ...createMapping(tableTags, extractContentData) }
}

async function extractTableData(page, element) {
    try {
        const tableData = await page.evaluate(table => {
            const rows = table.querySelectorAll('tr');
            const data = [];
            for (const row of rows) {
                const columns = Array.from(row.querySelectorAll('td, th'));
                const rowData = columns.map(column => column.textContent.trim());
                data.push(rowData)
            }
            return data;
        }, element);

        return tableData;
    } catch (error) {
        throw error;
    }
}
async function extractContentData(page, element) {
    const content = await page.evaluate(el => el.value || el.textContent, element);
    return content;
}

async function extractTextData(page, element) {
    // const tagName = await page.evaluate(el => el.tagName, element);
    const textContent = await page.evaluate(el => el.value || el.textContent, element);
    // return { [tagName.toLowerCase()]: textContent };
    return textContent;
}

async function extractListData(page, element) {
    const tagName = await page.evaluate(el => el.tagName, element);
    let result = '';
    if (tagName.toLowerCase() !== 'ul' || tagName.toLowerCase() !== 'ol' || tagName.toLowerCase() !== 'dl') {
        // return { [tagName.toLowerCase()]: [] }
        const content = await page.evaluate(el => el.textContent, element);
        result += result.concat(content);
    }
    return result;
}

async function extractFormData(page, element) {
    try {
        const extractedData = {};
        const content = await page.evaluate(el => el.value || el.textContent, element);
        // let result = '';
        if (!!content) {
            const elementId = await page.evaluate(el => el.id || el.name || el.tagName, element);
            const elementName = elementId.toLowerCase();
            if (!extractedData[elementName]) {
                extractedData[elementName] = {};
            }
            extractedData[elementName] = content.trim();
            // result += result.concat(content.trim());
        }

        return extractedData;
        // return result;
    } catch (error) {
        throw error;
    }
}

async function extractLinkData(page, element) {
    // const href = await page.evaluate(el => el.href, element);
    // return href;
    const href = await page.evaluate(el => el.href, element);
    const textContent = await page.evaluate(el => el.innerText.trim(), element);

    return { textContent, link: href };
}

async function extractImageData(page, element) {
    const src = await page.evaluate(el => el.src, element);
    return src;
}

function createMapping(tags, extractionFunction) {
    const result = tags.reduce((mapping, tag) => {
        mapping[tag] = extractionFunction;
        return mapping;
    }, {});
    return result;
}

async function executeMapping(page, element) {
    try {
        if (element) {
            // console.log("Proccessing element");

            const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);
            console.log(`Tag name: ${tagName}`);

            const extractionFunction = tagMappings[tagName];
            if (extractionFunction) {
                const extractedData = await extractionFunction(page, element);
                const cleanedData = cleanData(extractedData);
                if (cleanedData.length !== 0) {
                    return cleanedData;
                }
            } else {
                console.log(`No mapping function found for tagName: ${tagName}`);
            }
        }

        return null;
    } catch (error) {
        throw error;
    }
}

async function mapData(contentHtml) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',],
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' //local
    });
    try {
        let html = await utils.getContentFromS3Link('contentFiles/contentHtml-fda-1701823597486.txt');
        // fs.writeFileSync('../content/contentHtml.txt', JSON.stringify(html., null, 2));
        const page = await browser.newPage();
        // await page.goto("https://www.pdr.net/browse-by-drug-name?search=Aspirin", { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });

        await page.setContent(html, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });

        // Get all elements in the body
        const allElements = await page.$$('body *');

        // Extract the text content or other properties from the elements
        const elementData = await Promise.all(
            allElements.map(element => executeMapping(page, element))
        );

        // Log the results
        // console.log('All Elements:', elementData);
        const uniqueData = cleanUpList([...new Set(elementData.filter(el => el !== null))])

        fs.writeFileSync('./content/initialHTML.json', JSON.stringify(uniqueData, null, 2));

        return await browser.close();
    } catch (error) {
        console.log(error);
        if (browser) {
            await browser.close();
        }
    }
}

mapData();