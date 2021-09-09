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

const structJson = require('../back-end/structToJson');
//1
const pug = require('pug');
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
        var msg = welcomeResults[0].queryResult.fulfillmentText;
        console.log(msg);
        client.emit('returnResults', msg);
    });

    client.on('message', async function(msg) {
        const results = await detectIntent(msg);
        var responseMsg = results[0].queryResult.fulfillmentText;
 
        //2
        var payload = results[0].queryResult.fulfillmentMessages[0];
        let data = structJson.structProtoToJson(payload.payload);
        console.log(data);
        if (data && data.custom){
            client.emit('returnResults', templateHelper(data));
        } else {
            client.emit('returnResults', responseMsg); 
        }
    });
});

//3
function templateHelper(payload) {
    var str = payload.custom.pug;
    if(Array.isArray(payload.custom.pug)) {
    str = payload.custom.pug.join("");
    };

    var fn = pug.compile(str);
    var text = fn(payload.custom.locals)
    return text;
}


/**
 * Setup Dialogflow Integration
 */
function setupDialogflow(){
    sessionId = uuid.v4();
    
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
    delete request.queryInput.event;
    return responses;
 }

 
 setupDialogflow();