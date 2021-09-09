//1)
const { BigQuery } = require('@google-cloud/bigquery');
const DLP = require('@google-cloud/dlp');

//2)
const projectId = process.env.GCLOUD_PROJECT;
const bqDataSetName = 'chatanalytics'
const bqTableName = 'chatmessages';
const bq = new BigQuery();
const dlp = new DLP.DlpServiceClient();

// Make use of a dataset called: chatanalytics
const dataset = bq.dataset(bqDataSetName);
// Make use of a BigQuery table called: chatmessages
const table = dataset.table(bqTableName);


//3)
var detectPIIData = async function(text, callback) {
  // The minimum likelihood required before returning a match
  const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';
 

  //4)
  // The infoTypes of information to match
  const infoTypes = [ 
    {name: 'PERSON_NAME'}, 
    {name: 'FIRST_NAME'}, 
    {name: 'LAST_NAME'}, 
    {name: 'MALE_NAME'}, 
    {name: 'FEMALE_NAME'},
    {name: 'IBAN_CODE'},
    {name: 'IP_ADDRESS'},
    {name: 'LOCATION'},
    {name: 'SWIFT_CODE'},
    {name: 'PASSPORT'},
    {name: 'PHONE_NUMBER'},
    {name: 'NETHERLANDS_BSN_NUMBER'},
    {name: 'NETHERLANDS_PASSPORT'}
  ];
  

  // Construct transformation config which replaces sensitive info with its info type.
  // E.g., "Her email is xxx@example.com" => "Her email is [EMAIL_ADDRESS]"
  const replaceWithInfoTypeTransformation = {
    primitiveTransformation: {
      replaceWithInfoTypeConfig: {},
    },
  };

  // Construct redaction request
  const request = {
    parent: dlp.projectPath(projectId),
    item: {
      value: text,
    },
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [replaceWithInfoTypeTransformation],
      },
    },
    inspectConfig: {
      minLikelihood: minLikelihood,
      infoTypes: infoTypes,
    },
  };

  // Run string redaction
  try {
    //5) 
    const [response] = await dlp.deidentifyContent(request);
    const resultString = response.item.value;
    console.log(`REDACTED TEXT: ${resultString}`);
    if (resultString) {
      callback(resultString);
    } else {
      callback(text);
    }
  } catch (err) {
    console.log(`Error in deidentifyContent: ${err.message || err}`);
    callback(text);
  }
}


  //6)
  //Insert rows in BigQuery
  var insertInBq = function(row){

    console.log(row);

    table.insert(row, function(err, apiResponse){
      if (!err) {
        console.log("[BIGQUERY] - Saved.");
      } else {
        console.error(err);
      }
    });
  };


  //7)
  exports.subscribe = (data, context) => {
    const pubSubMessage = data;
    const buffer = Buffer.from(pubSubMessage.data, 'base64').toString();
    var buf = JSON.parse(buffer);
    
    var bqRow = {
      BOT_NAME: buf.botName,
      POSTED: (buf.posted/1000),
      INTENT_RESPONSE: buf.intentResponse.toString(),
      INTENT_NAME: buf.intentName,
      IS_FALLBACK: buf.isFallback, 
      IS_END_INTERACTION: buf.isEndInteraction,   
      CONFIDENCE: buf.confidence,
      PLATFORM: buf.platform,
      SESSION: buf.session,
      SCORE: buf.score,
      MAGNITUDE: buf.magnitude
    };

    //8)
    detectPIIData(buf.text, function(formattedText) {
      bqRow['TEXT'] = formattedText;
      insertInBq(bqRow);
    });
  };
