'use strict';

const {
  dialogflow,
  BasicCard,
  Button,
  Image,
  Suggestions
} = require('actions-on-google');

const functions = require('firebase-functions');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

function welcome(conv) {
    console.log('Dialogflow Request headers: ' + JSON.stringify(conv.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(conv.body));
    conv.ask(`Welcome to my agent!`);
  }
 
function fallback(conv) {
    console.log('Dialogflow Request headers: ' + JSON.stringify(conv.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(conv.body));

    conv.ask(`I didn't understand`);
    conv.ask(`I'm sorry, can you try again?`);
}

function yourFunctionHandler(conv, parameters) {
    conv.ask(`Ok. Buying product:`);
    console.log(parameters);

    conv.ask(new BasicCard({
        title: parameters.producttype,
        image: new Image({
           url: 'https://dummyimage.com/300x200/000/fff',
           alt: 'Image alternate text',
        }),
        text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
        buttons: new Button({
          title: 'This is a button',
          url: 'https://assistant.google.com/',
        })
    }));

    conv.ask(new Suggestions(`Quick Reply`));
    conv.ask(new Suggestions(`Suggestion`));
    conv.contexts.set({ name: 'gamestore-picked', lifespan: 2, parameters: { gameStore: 'DialogflowGameStore' }});
}

const app = dialogflow();

// Run the proper function handler based on the matched Dialogflow intent name
app.intent('Default Welcome Intent', welcome);
app.intent('Default Fallback Intent', fallback); 
app.intent('Buy product regex', yourFunctionHandler);

// Intent in Dialogflow called `Goodbye`
app.intent('Goodbye', conv => {
    conv.close('See you later!');
});
  
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);