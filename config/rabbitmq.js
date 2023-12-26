const amqp = require("amqplib");
const { getRabbitMQUrl } = require("../env");

async function connectRabbitMQ() {
    const url = getRabbitMQUrl();
    const queueName = 'crawl-urls';
    // const queueName = 'siteslevel_0';
    const messageContent = {
        "parentUrl": "https://search.aad.org/?Search=obesity",
        "spiderCode": "aad", "timeout": 10000, "level": 1, "maxlevel": 2,
        "taskId": 119, "rootTime": 1697880804342, "region": "us-east-1",
        "crawlerType": 2,
        "url": "https://www.aad.org/dw/dw-insights-and-inquiries/archive/dwii-dermatologic-surgery"
    };
    // const messageContent = {"SiteUrl":"https://www.bmj.com/search/advanced/medicine","TaskId":118,"Keyword":"medicine","EnableProxies":true,"SlowScrolling":true,"AutoPaginate":true,"TimeoutInSeconds":15000,"CrawlerType":1};
    try {
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        // Ensure the "crawl-urls" queue exists; it will be created if it doesn't.
        await channel.assertQueue(queueName, { durable: true });

        for (let i = 0; i < 10; i++) {
            // console.log({i});
            // Publish the message to the queue with the message content as a JSON string.
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(messageContent)))
        }

        console.log(`Sent 5000 messages to the ${queueName} queue.`);

        // Close the channel and connection when you're done.
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

connectRabbitMQ();
