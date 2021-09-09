'use strict';

const functions = require('firebase-functions');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

function handleRequest(map, request){
  	let intent;  
	if(request.body && request.body.queryResult && request.body.queryResult.intent){
    	    intent = request.body.queryResult.intent.displayName;
  	}
  
  	let response;	
	if (map.has(intent) !== false){
    	    response = map.get(intent)(request);
	} else {
    	    response = map.get('Default Fallback Intent')(request);
        }
  	return response;
}


function fallback(request) {
 return {
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            "I didn't understand.",
            "I'm sorry, can you try again?"
          ]
        }
      }
    ]
  };
}

function welcome(request) {
  return {
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            "Welcome to my agent!"
          ]
        }
      }
    ]
  };
}

function yourFunctionHandler(request) {
  let parameters;
  if(request.body.queryResult.parameters){
    parameters = request.body.queryResult.parameters;
  }
  console.log(parameters);
  return {
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            "Ok. Buying product:"
          ]
        }
      },
      {
        "card": {
          "title": `${parameters.producttype}`,
          "subtitle": "This is the body text of a card.  You can even use line\n  breaks and emoji! 💁",
          "imageUri": "https://dummyimage.com/300x200/000/fff",
          "buttons": [
            {
              "text": "This is a button",
              "postback": "https://console.dialogflow.com/"
            }
          ]
        }
      },
      {
        "quickReplies": {
          "quickReplies": [
            "Quick Reply",
            "Suggestion"
          ]
        }
      }
    ],
    "outputContexts": [
      {
        "name": `${request.body.session}/contexts/gamestore-picked`,
        "lifespanCount": 2,
        "parameters": {
          "gameStore": "DialogflowGameStore"
        }
      }
    ]
  };
}

// parameters can be retrieved from the request
// you will need to work with custom payloads for rich messages, see:
// https://cloud.google.com/dialogflow/docs/reference/rest/v2beta1/projects.agent.intents
// outputContext won't work if you dont set the full session path.


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Buy product regex', yourFunctionHandler);
    let webhookResponse = handleRequest(intentMap, request);
    console.log(webhookResponse);
    response.json(webhookResponse);
});