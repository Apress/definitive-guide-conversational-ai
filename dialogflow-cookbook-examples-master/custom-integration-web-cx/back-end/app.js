//1) These system variables can be set from the command-line with --PROJECT_ID, --PORT and --LANGUAGE
const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const agentId = process.env.AGENT_ID;

console.log(projectId, location, agentId);

const port = ( process.env.PORT || 8080 );
const languageCode = (process.env.LANGUAGE || 'en-US');

var  sessionClient, flowClient, startFlow, startPage, sessionId, sessionPath;

//2) Load all the libraries needed by this app
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');
const express = require('express');
const path = require('path');
// These are specific to Dialogflow
const uuid = require('uuid');

const df = require('@google-cloud/dialogflow-cx');


//3) Create an express app
const app = express();

//4) Setup Express, and load the static files and HTML page
app.use(cors());
app.use(express.static(__dirname + '/ui/'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/ui/index.html'));
});

//5) Create the Server and listen to the PORT variable
server = http.createServer(app);
io = socketIo(server);
server.listen(port, () => {
    console.log('Running server on port %s', port);
});

var connectedUsers = {}; 

//6 Socket.io listener, once the client connect to the server socket
// then execute this block.
io.on('connect', async (client) => {
    console.log(`Client connected [id=${client.id}]`);
    client.emit('server_setup', `Server connected [id=${client.id}]`);

    connectedUsers[client.id] = client;
    for (const property in connectedUsers) {
        console.log(`${property}: ${connectedUsers[property]}`);
      }

    //reset
    setupDialogflow();


    //7) When the client sends 'message' events
    // then execute this block
    
    // 7B When the client sends 'welcome' events
    // then execute this block
    // only when the client refreshes the page
    //const welcomeResults = await detectIntent('hi'); //TODO ideally you want to solve this with events.
    //connectedUsers[client.id].emit('returnResults', welcomeResults);

    connectedUsers[client.id].on('message', async function(msg) {
        console.log("here!");
        //console.log(msg);

        //8) A promise to do intent matching
        const results = await detectIntent(msg);
        //console.log(results); //NOTE: The results will be in queryResult.responseMessages

        //9) Return the Dialogflow after intent matching to the client UI.
        client.emit('returnResults', results);
    });
});

/**
 * Setup Dialogflow Integration
 */
async function setupDialogflow(){
    //10) Dialogflow will need a session Id
    sessionId = uuid.v4();
    
    //11) Dialogflow will need a DF Session Client
    // So each DF session is unique
    sessionClient = new df.SessionsClient();
    
    //12) Create a session path from the Session client, 
    // which is a combination of the projectId and sessionId.
    //sessionPath = `projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${sessionId}`;

    const sessionPath = sessionClient.projectLocationAgentSessionPath(
        projectId,
        location,
        agentId,
        sessionId
    );

    startFlow = `projects/${projectId}/locations/${location}/agents/${agentId}/flows/00000000-0000-0000-0000-000000000000`;
    startPage = `${startFlow}/pages/d09f2dda-4882-47f3-9e61-2be40607f506`;
    //13) These objects are in the Dialogflow request
    request = {
      session: sessionPath,
      queryInput: {
        languageCode: languageCode //NOTE: This moved into the queryInput i.so. queryInput.text
      }
    }

    flowClient = new df.FlowsClient();
    pageClient  = new df.PagesClient();
    //var r = await pageClient.listPages({parent: startFlow});
    //console.log(r);
}

 /*
  * Dialogflow Detect Intent based on Text
  * @param text - string
  * @return response promise
  */
 async function detectIntent(text){
    //14) Get the user utterance from the UI
    request.queryInput.text =  {
        text: text
    };
    console.log(request);
    
    //15) The Dialogflow SDK method for intent detection.
    // It returns a Promise, which will be resolved once the
    // fulfillment data comes in.
    const responses = await sessionClient.detectIntent(request);
    return responses;
 }