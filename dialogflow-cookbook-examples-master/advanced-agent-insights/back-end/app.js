//1)
const analytics = require('../back-end/analytics');
const structJson = require('../back-end/structToJson');

const projectId = process.env.npm_config_PROJECT_ID;
const port = ( process.env.npm_config_PORT || 3000 );
const languageCode = (process.env.npm_config_LANGUAGE || 'en-US');

const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');
const express = require('express');
const path = require('path');
const uuid = require('uuid');
const df = require('dialogflow').v2beta1;

//2)
const sessionId = uuid.v4();

const app = express();

app.use(cors());
app.use(express.static(__dirname + '/../ui/'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../ui/index.html'));
});

server = http.createServer(app);
io = socketIo(server);
server.listen(port, () => {
    console.log('Running server on port %s', port);
});

io.on('connect', (client) => {
    console.log(`Client connected [id=${client.id}]`);
    client.emit('server_setup', `Server connected [id=${client.id}]`);

    client.on('welcome', async function() {
        const welcomeResults = await detectIntentByEventName('welcome');
        client.emit('returnResults', welcomeResults);
    });

    //3)
    client.on('message', async function(msg) {
        const results = await detectIntent(msg);
        const result = results[0].queryResult;
        
        const timestamp = new Date().getTime();
        const platform = "web";
        const botName = "agent";

        var messages = [];
        if(result.fulfillmentMessages.length > 0) {
            for (let index = 0; index < result.fulfillmentMessages.length; index++) {
                const msg = result.fulfillmentMessages[index];
                if (msg.payload){
                    let data = structJson.structProtoToJson(msg.payload);
                    messages.push(data.web);
                } else {
                    messages.push(msg.text.text);
                }
            }
        }

        var obj = {
            text: result['queryText'],
            posted: timestamp,
            platform: platform,
            botName: botName,
            intentResponse: messages,
            language: result['languageCode'],
            platforms: result['intent'].defaultResponsePlatforms,
            intentName: result['intent'].displayName,
            isFallback: result['intent'].isFallback,
            isEndInteraction: result['intent'].endInteraction,
            confidence: result['intentDetectionConfidence'],
            session: sessionPath,
            score: result['sentimentAnalysisResult'].queryTextSentiment.score,
            magnitude: result['sentimentAnalysisResult'].queryTextSentiment.magnitude
        };

        console.log(obj);

        try {
            //console.log(obj);
            console.log(analytics);
            analytics.pushToChannel(obj);            
        } catch (error) {
            console.log(error)
        }

        
        client.emit('returnResults', results);
    });
});

/**
 * Setup Dialogflow Integration
 */
function setupDialogflow(){
    sessionClient = new df.SessionsClient();
    sessionPath = sessionClient.sessionPath(projectId, sessionId);
    request = {
      session: sessionPath,
      queryInput: {}
    }
}

 /*
  * Dialogflow Detect Intent based on Text
  * @param text - string
  * @return response promise
  */
 async function detectIntent(text){
    request.queryInput.text =  {
        languageCode: languageCode,
        text: text
    };
    console.log(request);

    const responses = await sessionClient.detectIntent(request);
    
    return responses;
 }


 /*
  * Dialogflow Detect Intent based on an Event
  * @param eventName - string
  * @return response promise
  */
 async function detectIntentByEventName(eventName){
    request.queryInput.event =  {
        languageCode: languageCode,
        name: eventName
    };
    const responses = await sessionClient.detectIntent(request);
    //remove the event, so the welcome event wont be triggered again
    delete request.queryInput.event;
    return responses;
 }

 //Run this code.
 setupDialogflow();