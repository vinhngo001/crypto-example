const { createWorker, createScheduler } = require('tesseract.js');
const fetch = require('node-fetch');

// URL of the image you want to check
const imageUrl = 'https://www.ncbi.nlm.nih.gov/corehtml/pmc/pmcgifs/bookshelf/thumbs/th-lactmed-lrg.png';

// Create a Tesseract worker
const worker = createWorker();
const scheduler = createScheduler();

(async () => {
    (await worker).load();
  (await worker).reinitialize('eng');
  await scheduler.addWorker(worker);

  // Fetch the image from the URL
  const response = await fetch(imageUrl);
  const imageBuffer = await response.buffer();

  // Perform OCR on the image
  await scheduler.addJob('recognize', { buffer: imageBuffer });
  await scheduler.terminate();

  // Get the result of OCR
  const { data: { text } } = await worker.getOCRResults();

  // Check if the recognized text contains any logo-related keywords
  const logoKeywords = ['logo', 'brand', 'company', 'corporate'];
  const containsLogo = logoKeywords.some(keyword => text.toLowerCase().includes(keyword));

  if (containsLogo) {
    console.log('This image may contain a logo. Skipping...');
  } else {
    console.log('This image does not appear to be a logo. Proceed...');
  }

  await worker.terminate();
})();
