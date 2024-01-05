const puppeteer = require("puppeteer-core");
const { compare } = require("dom-compare");
const { diffHtml } = require("html-differ")
const fs = require("fs");
const { JSDOM } = require("jsdom")

// async function compareWebsites(url1, url2) {
//     const browser = await puppeteer.launch({
//         args: ['--no-sandbox',],
//         headless: true,
//         ignoreHTTPSErrors: true,
//         executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' //local
//     });

//     try {
//         const page1 = await browser.newPage();
//         await page1.goto(url1, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });
//         const dom1 = await page1.evaluate(() => document.body.innerHTML);
//         // fs.writeFileSync('../content/dom1.html', dom1);

//         const page2 = await browser.newPage();
//         await page2.goto(url2, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });
//         const dom2 = await page2.evaluate(() => document.body.innerHTML);
//         // fs.writeFileSync('../content/dom2.html', dom2);

//         const jsdom1 = new JSDOM(dom1);
//         const jsdom2 = new JSDOM(dom2);

//         const comparison = compare(jsdom1.window.document, jsdom2.window.document);
//         const similarityPercentage = calculateSimilarityPercent(JSON.stringify(dom1), JSON.stringify(dom2));
//         // const similarityPercentage = comparison.getSimilarity();
//         console.log('Similarity Percentage:', similarityPercentage.toFixed(2) + '%');
//         if (comparison._diff.length === 0) {
//             console.log('The HTML structures are similar.');

//         } else {
//             console.log('The HTML structures are different');
//         }
//         await browser.close();
//         return;
//     } catch (error) {
//         console.log(error);
//         if (browser) {
//             await browser.close();
//         }
//     }
// }

// function calculateSimilarityPercent(dom1, dom2) {
//     try {
//         const totalChars = dom1.length;
//         const differingChars = Array.from(dom1).filter((char, index) => char !== dom2[index]).length;
//         return ((totalChars - differingChars) / totalChars) * 100;
//     } catch (error) {
//         throw error;
//     }
// }

// compareWebsites('https://github.com/conanak99', 'https://github.com/codergogoi');

async function getHtml(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Local path
    });
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });
        // const html = await page.content();
        // const $1 = await page.setContent(html);
        const contentHtml = new Set(await page.$$eval('*', elements => elements.map(element => element.tagName.toLowerCase())));
        await browser.close();
        return contentHtml;
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        throw error;
    }
}

function calculateSimilarityPercentage(tagSet1, tagSet2) {
    try {
        const intersection = new Set([...tagSet1].filter(element => tagSet2.has(element)));
        const union = new Set([...tagSet1, ...tagSet2]);
        const similarity = (intersection.size / union.size) * 100;
        return similarity.toFixed(2);
    } catch (error) {
        throw error;
    }
}

async function compareHtmlConstructor(url1, url2) {
    try {
        const tagSet1 = await getHtml(url1);
        const tagSet2 = await getHtml(url2);

        const similarityPercentage = calculateSimilarityPercentage(tagSet1, tagSet2);
        console.log(`HTML structure similarity: ${similarityPercentage}%`);
        return;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

compareHtmlConstructor('https://github.com/conanak99', 'https://replit.com/');