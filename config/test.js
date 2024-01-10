const spiderCode = 'picscheme';
const keyword = 'drug';
////////

const spider = require(`./spiders/${spiderCode}`);

const searchUrls = require('./helpers/conf/crawl-searchurl').crawlSearchUrl;
// const searchUrls = require('./layers/utils/nodejs/node_modules/utils/helpers/conf/crawl-searchurl').crawlSearchUrl;

; (async () => {
    let searchUrl = searchUrls[spiderCode];
    searchUrl = searchUrl.replace(/\$1/g, keyword);
    let autoPaginate = true;
    let slowScrolling = false;
    let idSearch = 1;
    let functionId = "035";
    let rootTime = "1691228001710";

    let param = {
        "searchUrl": searchUrl, "idSearch": idSearch, "limitPage": 0, "spiderCode": spiderCode,
        "param": {
            "CRW_LEVEL": 5, "FR_PAGE": null, "TO_PAGE": null,
            "TASK_ID": idSearch, "searchname": keyword, "enableProxies": true,
            "slowScrolling": slowScrolling, "autoPaginate": autoPaginate, "timeout": 20000,
            "crawlerType": 2,
        }, "rootTaskId": functionId, "rootTime": rootTime, "functionId": 1
    }
    console.log(JSON.stringify(param));
    return
    // const functionSearch = `${spiderCode}Search`;
    // await spider[functionSearch](param, null);
})();