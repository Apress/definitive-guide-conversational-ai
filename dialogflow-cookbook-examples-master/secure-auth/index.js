'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// Dialogflow Fulfillment Code

function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function yourFunctionHandler(agent) {
    agent.add(`Ok. Buying product:`);
    console.log(agent.parameters);
    agent.add(new Card({
        title: agent.parameters.producttype,
        imageUrl: 'https://dummyimage.com/300x200/000/fff',
        text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
        buttonText: 'This is a button',
        buttonUrl: 'https://console.dialogflow.com/'
        })
    );
    agent.add(new Suggestion(`Quick Reply`));
    agent.add(new Suggestion(`Suggestion`));
    agent.context.set({ name: 'gamestore-picked', lifespan: 2, parameters: { gameStore: 'DialogflowGameStore' }});
}


// Express Code
const app = express().use(bodyParser.json());


// Basic Authentication
app.use(basicAuth({
    users: { 'admin': 'supersecret' }
}));

app.use(function(req, res, next) {
    if (!req.headers['x-auth']) {
      return res.status(403).send( 'No auth headers sent!');
    }
    next();
});


//curl -X POST -H "Content-Type: application/json" -d @stub.json http://localhost:8080/fulfillment
//curl -X POST -u admin:supersecret -H "x-auth: true" -H "Content-Type: application/json" -d @stub.json http://localhost:8080/fulfillment


app.post('/fulfillment', (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Buy product regex', yourFunctionHandler);
    agent.handleRequest(intentMap);
});


app.get('/', (req, res) => {
    res.send(`OK`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Dialogflow Fulfillment listening on port', port);
});


