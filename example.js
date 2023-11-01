// const fetch = require('node-fetch');
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const https = require('https');
// const { createWorker, createScheduler, recognize } = require('tesseract.js');
// const crypto = require("crypto");
const tesseract = require('tesseract.js');
// URL of the image you want to check
const imageUrl = 'https://www.ncbi.nlm.nih.gov/corehtml/pmc/pmcgifs/bookshelf/thumbs/th-lactmed-lrg.png'; //https://tesseract.projectnaptha.com/img/eng_bw.png
const imagePath = './Funny-Minion-Quotes.jpg';
// const tesseract = require("node-tesseract-ocr");

// const config = {
// 	lang: "eng",
// 	oem: 1,
// 	psm: 3,
// }

// tesseract
//   .recognize(imageUrl, config)
//   .then((text) => {
//     console.log("Result:", text)
//   })
//   .catch((error) => {
//     console.log(error.message)
//   })

// const ReadText = require('text-from-image')

// ReadText(imageUrl).then(text => {
//     console.log(text);
// }).catch(err => {
//     console.log(err);
// })

tesseract.recognize(
  imagePath,
  'eng',
  // { logger: m => console.log(m) }
).then(({ data: { text } }) => {
  const logoKeywords = ['logo', 'brand', 'company', 'corporate'];
  const containsLogo = logoKeywords.some(keyword => text.toLowerCase().includes(keyword));
  if (containsLogo) {
    console.log('This image may contain a logo. Skipping...');
  } else {
    console.log('This image does not appear to be a logo. Proceed...');
  }
});
