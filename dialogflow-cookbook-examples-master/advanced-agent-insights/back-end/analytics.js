//1)
const { BigQuery } = require('@google-cloud/bigquery');
const { PubSub } = require('@google-cloud/pubsub');

//2)
const pubsub = new PubSub({
    projectId: process.env.npm_config_PROJECT_ID
});

const bigquery = new BigQuery({
    projectId: process.env.npm_config_PROJECT_ID
});

//3)
const id = process.env.npm_config_PROJECT_ID;
const dataLocation = 'US';
const datasetChatMessages = 'chatanalytics';
const tableChatMessages = 'chatmessages';
const topicChatbotMessages = 'chatbotanalytics';

//4)
// tslint:disable-next-line:no-suspicious-comment
const schemaChatMessages = "BOT_NAME,TEXT,POSTED:TIMESTAMP,SCORE:FLOAT,MAGNITUDE:FLOAT,INTENT_RESPONSE,INTENT_NAME,CONFIDENCE:FLOAT,IS_FALLBACK:BOOLEAN,IS_END_INTERACTION:BOOLEAN,PLATFORM,SESSION";

//5)
/**
 * Analytics class to store chatbot analytics in BigQuery. 
 */
class Analytics {

    //6)
    constructor() {
        this.setupBigQuery(datasetChatMessages, 
            tableChatMessages, dataLocation, schemaChatMessages);

        this.setupPubSub(topicChatbotMessages);
    }

    //7)
    /**
     * If dataset doesn't exist, create one.
     * If table doesn't exist, create one.
     * @param {string} bqDataSetName BQ Dataset name
     * @param {string} bqTableName BQ Table name 
     * @param {string} bqLocation BQ Data Location
     * @param {string} schema BQ table schema  
     */
    setupBigQuery(bqDataSetName, bqTableName, bqLocation, schema) {
        const dataset = bigquery.dataset(bqDataSetName);
        const table = dataset.table(bqTableName);

        dataset.exists(function(err, exists) {
            if (err) console.error('ERROR', err);
            if (!exists) {
                    dataset.create({
                    id: bqDataSetName,
                    location: bqLocation
                }).then(function() {
                    console.log("dataset created");
                    // If the table doesn't exist, let's create it.
                    // Note the schema that we will pass in.
                    table.exists(function(err, exists) {
                        if (!exists) {
                            table.create({
                                id: bqTableName,
                                schema: schema
                            }).then(function() {
                                console.log("table created");
                            });
                        } else {
                            console.error('ERROR', err);
                        }
                    });
                });
            }
        });


        table.exists(function(err, exists) {
            if (err) console.error('ERROR', err);
            if (!exists) {
                table.create({
                    id: bqTableName,
                    schema: schema
                }).then(function() {
                    console.log("table created");
                });
            }
        });
    }

    //8)
    /**
     * If topic is not created yet, please create.
     * @param {string} topicName PubSub Topic Name
     */
    setupPubSub(topicName) {
        const topic = pubsub.topic(`projects/${id}/topics/${topicName}`);
        topic.exists((err, exists) => {
            if (err) console.error('ERROR', err);
            if (!exists) {
                pubsub.createTopic(topicName).then(results => {
                    console.log(results);
                    console.log(`Topic ${topicName} created.`);
                })
                .catch(err => {
                    console.error('ERROR:', err);
                });
            }
        });
    }

    //9)
    /**
     * Execute Query in BigQuery
     * @param {string} sql SQL Query
     * @return {Promise<bigQueryRow>}
     */
    queryBQ(sql) {
        return new Promise(function(resolve, reject) {
            if (sql) {
                bigquery.query(sql).then(function(data) {
                    resolve(data);
                });
            } else {
                reject("ERROR: Missing SQL");
            }
        });
    }

    //10)
    /**
     * Push to PubSub Channel
     * @param {object} json JSON Object
     * @return {Promise<any>}
     */
    async pushToChannel(json) {
        const topic = pubsub.topic(`projects/${id}/topics/${topicChatbotMessages}`);
        let dataBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
        try {
            const messageId = await topic.publish(dataBuffer);
            console.log(`Message ${messageId} published to topic: ${topicChatbotMessages}`);
        } catch(error) {
            console.log(error)
        }
    }
}

module.exports = analytics = new Analytics();