const puppeteer = require("puppeteer-core");
const { compare } = require("dom-compare");
const { diffHtml } = require("html-differ")
const fs = require("fs");
const { JSDOM } = require("jsdom")

async function compareWebsites(url1, url2) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',],
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' //local
    });

    try {
        const page1 = await browser.newPage();
        await page1.goto(url1, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });
        const dom1 = await page1.evaluate(() => document.body.innerHTML);
        // fs.writeFileSync('../content/dom1.html', dom1);

        const page2 = await browser.newPage();
        await page2.goto(url2, { waitUntil: ['networkidle2', 'domcontentloaded'], timeout: 20000 });
        const dom2 = await page2.evaluate(() => document.body.innerHTML);
        // fs.writeFileSync('../content/dom2.html', dom2);

        const jsdom1 = new JSDOM(dom1);
        const jsdom2 = new JSDOM(dom2);

        const comparison = compare(jsdom1.window.document, jsdom2.window.document);
        if (comparison._diff.length === 0) {
            console.log('The HTML structures are similar.');
            const similarityPercentage = calculateSimilarityPercent(JSON.stringify(dom1), JSON.stringify(dom2));
            // const similarityPercentage = comparison.getSimilarity();
            console.log('Similarity Percentage:', similarityPercentage.toFixed(2) + '%');
        } else {
            console.log('The HTML structures are different');
        }
        await browser.close();
        return;
    } catch (error) {
        console.log(error);
        if (browser) {
            await browser.close();
        }
    }
}

function calculateSimilarityPercent(dom1, dom2) {
    console.log({dom1, dom2})
    try {
        const totalChars = dom1.length;
        const differingChars = Array.from(dom1).filter((char, index) => char !== dom2[index]).length;
        return ((totalChars - differingChars) / totalChars) * 100;
    } catch (error) {
        throw error;
    }
}

compareWebsites('https://github.com/conanak99', 'https://github.com/codergogoi');