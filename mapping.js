const puppeteer = require("puppeteer-core");
const fs = require('fs')
const { parse } = require('himalaya');
const html = fs.readFileSync('content/contentHtml.txt', { encoding: 'utf-8' });
// console.log({html});
// return 
const json = parse(html);
// fs.writeFileSync('content/finalHTML.json', JSON.stringify(json, null, 2));
// console.log('👉', json);

const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'abbr', 'acronym', 'address', 'bdo', 'blockquote', 'cite', 'q', 'code', 'ins', 'del', 'dfn', 'kbd', 'pre', 'samp', 'var', 'br'];
const linkTags = ["a", "base"];
const imageTags = ["img", "area", "map", "param", "object", "iframe"];
const listTags = ["ul", "ol", "li", "dl", "dt", "dd"];
const tableTags = ["table", "tr", "td", "th", "tbody", "thead", "tfoot", "col", "colgroup", "caption"];
const scripTags = ["script", "noscript"];
const formTags = ["form", "input", "textarea", "select", "option", "optgroup", "button", "label", "fieldset", "legend"];

const tagMappings = {
    ...createMapping(textTags, extractTextContent),
    // ...createMapping(linkTags, extractLinkData),
    // ...createMapping(imageTags, extractImageData),
    // ...createMapping(formTags, extractFormData),
    // ...createMapping(scripTags, extractFormData),
    ...createMapping(listTags, extractTextContent)
}

async function extractTextContent(page, element) {
    const tagName = await page.evaluate(el => el.tagName, element);
    const textContent = await page.evaluate(el => el.textContent, element);
    return { [tagName.toLowerCase()]: textContent };
}

async function extractFormData(page, element) {
    try {
        const extractedData = {};
        const content = await page.evaluate(el => el.value || el.textContent, element);

        if (!!content) {
            const elementId = await page.evaluate(el => el.id || el.name || el.tagName, element);
            const elementName = elementId.toLowerCase();
            if (!extractedData[elementName]) {
                extractedData[elementName] = {};
            }
            extractedData[elementName] = content.trim();
        }

        return extractedData;
    } catch (error) {
        throw error;
    }
}

async function extractLinkData(page, element) {
    const tagName = await page.evaluate(el => el.tagName, element);
    const href = await page.evaluate(el => el.href, element);
    // return href;
    return { [tagName.toLowerCase()]: href };
}

async function extractImageData(page, element) {
    const tagName = await page.evaluate(el => el.tagName, element);
    const src = await page.evaluate(el => el.src, element);
    // return src;
    return { [tagName.toLowerCase()]: src };
}

function createMapping(tags, extractionFunction) {
    return tags.reduce((mapping, tag) => {
        mapping[tag] = extractionFunction;
        return mapping;
    }, {});
}

async function executeMapping(page, element) {
    if (element) {
        console.log(`Processing element `);

        const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);
        console.log(`Tag name: ${tagName}`);

        const extractionFunction = tagMappings[tagName];
        if (extractionFunction) {
            const result = await extractionFunction(page, element);
            return result;
        } else {
            console.log(`No mapping function found for tagName: ${tagName}`);
        }
    }

    return null;
}

function mapData(element) {
    // Check if the element has text content
    if (element.type === 'text' && element.content.trim() !== '') {
        return element.content.trim();
    }

    // Check if the element has children
    if (element.children && element.children.length > 0) {
        const mappedChildren = element.children.map(mapData);

        // Join the results if there is text content
        const textContent = mappedChildren.join('').trim();
        if (textContent !== '') {
            return textContent;
        }
    }

    return '';
}

// const result = mapData(json[0]);
// console.log({result});

async function main(contentHtml) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',],
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' //local
    });
    try {
        const page = await browser.newPage();
        await page.goto("https://www.pdr.net/browse-by-drug-name?search=Aspirin", { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });

        // await page.setContent(contentHtml, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });

        // Get all elements in the body
        const allElements = await page.$$('body *');

        // Extract the text content or other properties from the elements
        const elementData = await Promise.all(
            allElements.map(element => executeMapping(page, element))
        );

        // Log the results
        // console.log('All Elements:', elementData);
        fs.writeFileSync('content/initialHTML.json', JSON.stringify(elementData.filter(el => el !== null && Object.keys(el).length > 0), null, 2));
        return await browser.close();
    } catch (error) {
        console.log(error);
        if (browser) {
            await browser.close();
        }
    }
}

main(html);