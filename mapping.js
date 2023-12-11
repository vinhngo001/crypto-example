const puppeteer = require("puppeteer-core");

// async function extractTextContent(page, selector) {
//     try {
//         const textContent = await page.evaluate(el => el.textContent, selector);
//         return textContent.trim() || null;
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }

// async function extractSrcAttribute(page, selector) {
//     const src = await page.evaluate(el => el.getAttribute('src'), element);
//     return src || null;
// }

// async function extractHrefAttribute(page, selector) {
//     try {
//         const href = await page.evaluate(el => el.getAttribute('href'), selector);
//         return href || null;
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }

// const mappingFunctions = {
//     'h1': extractTextContent,
//     'img': extractSrcAttribute,
//     'p': extractTextContent,
//     'a': extractHrefAttribute
//     // 'TABLE': extractTableContent,
//     // Add more mappings for other element types
// };

// async function executeMapping(page, element) {
//     if (element) {
//         // console.log(`Processing element `);
//         // console.log(element);

//         const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);
//         console.log(`Tag name: ${tagName}`);

//         const mappingFunction = mappingFunctions[tagName];
//         if (mappingFunction) {
//             const result = await mappingFunction(page, element);
//             console.log({ result });
//             return result;
//         } else {
//             console.log(`No mapping function found for tagName: ${tagName}`);
//             // Default handling (you can add more default logic if needed)
//             return await page.evaluate(el => el.textContent, element);
//         }
//     } else {
//         // Handle the case where element is undefined
//         console.log('Invalid element:', element);
//         return null;
//     }
// }

const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'abbr', 'acronym', 'address', 'bdo', 'blockquote', 'cite', 'q', 'code', 'ins', 'del', 'dfn', 'kbd', 'pre', 'samp', 'var', 'br'];
const linkTags = ["a", "base"];
const imageTags = ["img", "area", "map", "param", "object"];
const listTags = ["ul", "ol", "li", "dl", "dt", "dd"];
const tableTags = ["table", "tr", "td", "th", "tbody", "thead", "tfoot", "col", "colgroup", "caption"];
const scripTags = ["script", "noscript"];
const formTags = ["form", "input", "textarea", "select", "option", "outgroup", "button", "label", "fieldset", "legend"];

const tagMappings = {
    ...createMapping(textTags, extractTextContent),
    ...createMapping(linkTags, extractLinkData),
    ...createMapping(imageTags, extractImageData),
    ...createMapping(formTags, extractFormData),
    ...createMapping(listTags, extractListData)
}

async function extractTextContent(page, element) {
    const textContent = await page.evaluate(el => el.textContent, element);
    return textContent;
}

async function extractFormData(page, element) {

}

async function extractListData(page, element){

}

async function extractLinkData(page, element) {
    const href = await page.evaluate(el => el.href, element);
    return href;
}

async function extractImageData(page, element){
    const src = await page.evaluate(el => el.src, element);
    return src;
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

        // const tagName = element.tagName.toLowerCase();
        const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);
        console.log(`Tag name: ${tagName}`);

        const extractionFunction = tagMappings[tagName];
        if (extractionFunction) {
            const result = await extractionFunction(page, element);
            return result;
        }else{
            console.log(`No mapping function found for tagName: ${tagName}`);
        }
    }

    return null;
}

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',],
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' //local
    });
    try {
        const page = await browser.newPage();
        await page.goto("https://www.fda.gov/news-events/press-announcements/fda-approves-first-vaccine-prevent-disease-caused-chikungunya-virus", { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });

        // Get all elements in the body
        const allElements = await page.$$('body *');

        // Extract the text content or other properties from the elements
        const elementData = await Promise.all(
            allElements.map(element => executeMapping(page, element))
        );

        // Log the results
        console.log('All Elements:', elementData);
        return await browser.close();
    } catch (error) {
        console.log(error);
        if (browser) {
            await browser.close();
        }
    }
})();