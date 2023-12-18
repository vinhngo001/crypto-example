function cleanData(inputData) {
    const typeOfInput = typeof inputData;
    switch (typeOfInput) {
        case 'object':
            if (Array.isArray(inputData)) {
                // If inputData is already an array, use it directly
                return inputData.join('');
            } else {
                // If inputData is an object, concatenate its values
                return Object.values(inputData).join('');
            }
        case 'string':
            // For string input
            return inputData.trim().replace(/\s+/g, ' ').replace(/\n/g, '');
        default:
            return inputData;
    }
}
function filterListRecursive(inputList, currentIndex = 0, currentResult = '') {
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