'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { WebhookClient} = require('dialogflow-fulfillment');

//1
const i18n = require('i18n');
i18n.configure({
  locales: ['en-US', 'nl-NL'],
  directory: __dirname + '/locales',
  defaultLocale: 'en-US'
});

//2
const moment = require('moment');
require('moment/locale/nl');

//3
const numeral = require('numeral');
numeral.register('locale', 'nl', {
  delimiters: {
      thousands: ',',
      decimal: '.'
  },
  abbreviations: {
      thousand: 'k',
      million: 'm',
      billion: 'b',
      trillion: 't'
  },
  ordinal: function (number) {
      var b = number % 10;
      return (~~ (number % 100 / 10) === 1) ? 'th' :
          (b === 1) ? 'st' :
          (b === 2) ? 'nd' :
          (b === 3) ? 'rd' : 'th';
  },
  currency: {
      symbol: '€'
  }
});


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

//4
function welcome(agent) {
  agent.add(i18n.__('WELCOME_BASIC'));
}

function fallback(agent) {
  agent.add(i18n.__('FALLBACK_BASIC'));
}

function getPrice(agent) {
  agent.add(i18n.__('PRICE', numeral(399).format('($0,0)')));
}

function getDeliveryDate(agent) {
  agent.add(i18n.__('DELIVERY_DATE', moment().format('LL')));
}

function getTotalNumber(agent) {
  agent.add(i18n.__('TOTAL_AMOUNT', numeral(1000).format('0,0')));
}


// Express Code
const app = express().use(bodyParser.json());

app.post('/fulfillment', (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    //5
    var lang = request.body.queryResult.languageCode;
    var langCode;
    if(lang === "nl") langCode = "nl-NL";
    if(lang === "en") langCode = "en-US";
    i18n.setLocale(langCode);
    moment.locale(lang);
    numeral.locale(lang);

    //6
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
  
    intentMap.set('Get_Price', getPrice);
    intentMap.set('Get_Delivery_Date', getDeliveryDate);
    intentMap.set('Get_Total_Number', getTotalNumber);
    agent.handleRequest(intentMap);
});


app.get('/', (req, res) => {
    res.send(`OK`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Dialogflow Fulfillment listening on port', port);
});


