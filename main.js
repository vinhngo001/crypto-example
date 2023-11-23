const compromise = require('compromise');

const hrefData = [
	'https://example.com/page1',
	'https://example.com/page2',
	'https://another-example.com/about',
];

// Apply compromise to each href
const analyzedData = hrefData.map((href) => {
	const doc = compromise(href);

	// Perform some basic analysis
	const words = doc.out('array');
	const isSecure = href.startsWith('https://');
	const domain = new URL(href).hostname;

	return {
		href,
		words,
		// isSecure,
		// domain,
	};
});

console.log('Analyzed Href Data:', analyzedData);
