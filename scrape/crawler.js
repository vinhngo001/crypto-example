const puppeteer = require('puppeteer');
const fs = require("fs");
const nlp = require('nlp-compromise');
const compromise = require('compromise');

// async function crawlWebsite(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     // Extract text content
//     const textContent = await page.evaluate(() => {
//         return document.body.innerText;
//     });

//     await browser.close();

//     return textContent;
// }
// let textContent= "";
// // Example usage
// const url = 'https://example.com';
// crawlWebsite(url).then(content => {
//     textContent = content
//     console.log(content);
// });

// const compromise = require('compromise');

// function performNLP(text) {
//     const doc = compromise(text);
// console.log({doc})
//     // Tokenizing
//     const tokens = doc.terms().out('array');

//     // Part of Speech Tagging
//     const posTags = doc.terms().out('tags');

//     // Named Entity Recognition
//     // const nerTags = doc.entities().out('tags');

//     return { tokens, posTags, 
//         // nerTags 
//     };
// }

// // Example usage
// const text = 'Some sample text for NLP processing.';
// const nlpResults = performNLP(text);
// console.log({nlpResults});


// function classifyPage(nlpResults) {
//     // Implement your classification logic based on NLP results
//     const containsData = nlpResults.tokens.includes('data');

//     return containsData;
// }

// // Example usage
// const isDataPage = classifyPage(nlpResults);
// console.log(`Is data page? ${isDataPage}`);


// function extractData(text) {
//     const regex = /(?:Your extraction regex here)/;
//     const match = text.match(regex);

//     return match ? match[0] : null;
// }

// // Example usage
// const extractedData = extractData(textContent);
// console.log(`Extracted data: ${extractedData}`);

async function crawlWebsite(url) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);

	// Extract all href links
	const hrefLinks = await page.$$eval('a', (links) => links.map(link => link.href));

	const uniqueUrlSet = new Set(hrefLinks.filter(href => href !== 'javascript:void(0)'));
	const itemUrls = [...uniqueUrlSet];

	// Print the extracted links
	console.log(`Links on ${url}:`);
	itemUrls.forEach((link, index) => {
		console.log(`${index + 1}. ${link}`);
	});

	// Save the links to a JSON file
	const result = {
		website: url,
		links: itemUrls
	};

	await browser.close();

	return result;
}

const targetWebsites = [
	'https://mohap.gov.ae/en/search?keywords=drug',
	'https://www.ecetoc.org/?s=virus'
];

// Use Promise.all to run all crawls concurrently
Promise.all(targetWebsites.map(url => crawlWebsite(url)))
	.then(results => {
		const resultJSON = JSON.stringify(results, null, 2);
		fs.writeFileSync('results.json', resultJSON);
		console.log('Links saved to results.json');
	})
	.catch(error => console.error(error));


// Sample plain text from the crawler
const plainText = "https://mohap.gov.ae/en/search?keywords=drug";

// Tokenization
const tokens = compromise.tokenize(plainText);
console.log('Tokens:', tokens.out('array'));

// Part of Speech (POS) Tagging
const taggedText = tokens.tag();
console.log('POS Tagging:', taggedText.out('array'));