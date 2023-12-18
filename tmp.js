function divideTextAndLinks(data) {
    const textGroup = [];
    const linkGroup = [];

    data.forEach(item => {
        if (typeof item === 'object' && item.textContent && item.link) {
            // If the item is an object with "textContent" and "link" properties
            textGroup.push(item.textContent);
            linkGroup.push(item.link);
        } else if (typeof item === 'string') {
            // If the item is a string
            if (item.startsWith('http')) {
                // If it starts with "http" or "about:", treat it as a link
                linkGroup.push(item);
            } else {
                // Otherwise, treat it as text
                textGroup.push(item);
            }
        }
    });

    return {
        textGroup,
        linkGroup
    };
}

const dataList = [
    {
        "textContent": "Skip directly to site content",
        "link": "about:blank#content"
    },
    {
        "textContent": "Skip directly to search",
        "link": "about:blank#headerSearch"
    },
    "/obesity/images/homepage/childhood-obesity-month-647x336-1.jpg",
    "Five things you can do at home."
];

const result = divideTextAndLinks(dataList);

console.log('Text Group:', result.textGroup);
console.log('Link Group:', result.linkGroup);
