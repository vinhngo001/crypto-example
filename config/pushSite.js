const fs = require('fs');
const path = require('path');
const ini = require('ini');
const amqplib = require('amqplib');
const config = ini.parse(fs.readFileSync(path.resolve(__dirname, '../config/conf.ini'), 'utf-8'));
const constants = require('../constants/system');

(async() => {
    try {
        //1. connect
        const amqpUrl = config.rabbitmq.amqpUrl;
        const connection = await amqplib.connect(amqpUrl);

        //2. create channel
        const channel = await connection.createChannel();

        //
        const queueName = constants.queueSiteUrl;
        await channel.assertQueue(queueName, {
            durable: true
        });

        let sites = [
           {"SiteUrl":"https://www.incb.org","TaskId":140,"Keyword":"virus","EnableProxies":true,"SlowScrolling":false,"AutoPaginate":false,"TimeoutInSeconds":30,"CrawlerType":2},
            // {"SiteUrl":"https://search.cdc.gov","TaskId":140,"Keyword":"obesity","EnableProxies":true,"SlowScrolling":false,"AutoPaginate":false,"TimeoutInSeconds":30,"CrawlerType":1},
            // {"SiteUrl":"https://diabetes.org","TaskId":140,"Keyword":"insulin","EnableProxies":true,"SlowScrolling":false,"AutoPaginate":false,"TimeoutInSeconds":30,"CrawlerType":1},
            // {"SiteUrl":"https://www.kidney.org","TaskId":140,"Keyword":"insulin","EnableProxies":true,"SlowScrolling":false,"AutoPaginate":false,"TimeoutInSeconds":15,"CrawlerType":1},
            // {"SiteUrl":"'https://medlineplus.gov","TaskId":140,"Keyword":"metham","EnableProxies":true,"SlowScrolling":false,"AutoPaginate":false,"TimeoutInSeconds":15,"CrawlerType":1}
        ]
        
        for(let site of sites) {
            message = JSON.stringify(site);
            channel.sendToQueue(queueName, Buffer.from(message), { persistent: true});
        }
        
        await channel.close();
        await connection.close();
             
    } catch(error) {
        console.log(error)
    }
})();