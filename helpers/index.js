function cleanData(input) {
    const typeOfInput = typeof input;
    switch (typeOfInput) {
        case 'object':
            const cleanedObject = {};
            for (const key in input) {
                if (typeof input[key] === 'string') {
                    cleanedObject[key] = cleanData(input[key]);
                } else {
                    cleanedObject[key] = input[key];
                }
            }
            return cleanedObject;
        case 'string':
            // For string input
            return input.trim().replace(/\s+/g, ' ').replace(/\n/g, '');
        default:
            return input;
    }
}
function filterListRecursive(inputList, currentIndex = 0, currentResult = '') {
    let results = [];
    if (currentIndex === inputList.length) {
        return currentResult ? [currentResult] : [];
    }

    const currentItem = inputList[currentIndex];

    if (currentItem.includes(currentResult)) {
        const nextResult = currentItem.length > currentResult.length ? currentItem : currentResult;
        return filterListRecursive(inputList, currentIndex + 1, nextResult);
    }

    return filterListRecursive(inputList, currentIndex + 1, currentResult)
}

function filterSubstringsRecursive(item, otherItems) {
    if (otherItems.length == 0) {
        return true;
    }

    const [firstItem, ...restItems] = otherItems;
    if (firstItem.includes(item)) {
        return false;
    }

    return filterSubstringsRecursive(item, restItems);
}

function cleanUpListRecursive(originalList) {
    return originalList.filter((item, index) => {
        return filterSubstringsRecursive(item, originalList.slice(0, index).concat(originalList.slice(index + 1)))
    });
}

module.exports = {
    cleanData,
    filterList: filterListRecursive,
    cleanUpList: cleanUpListRecursive
};