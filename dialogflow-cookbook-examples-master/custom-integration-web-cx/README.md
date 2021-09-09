# Dialogflow CX custom integration

**by: Lee Boonstra, Developer Advocate Conversational AI, Google Cloud**

## LIVE EXAMPLE

https://dialogflow-cx-demo-285510.uc.r.appspot.com

## USE CONTAINER FOR YOUR OWN AGENTS

This will deploy a custom App Engine Flex container with your own Dialogflow CX agent:

1. Modify environment vars in Dockerfile

  *You can see which values you will need to fill in, by looking into the URL bar of the Dialogflow CX console. Or clicking on the Agents Dropdown > View all agents.*

1. `gcloud app deploy`

## RUN LOCALLY

1. Download the service account key on your machine, which has access to your project: You can do this from the GCP console: IAM & Admin > Service Accounts. Take the account with the Dialogflow Integrations role, and create a JSON key. Store this somewhere save on your machine.

    In your terminal run:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/JSONkey

    For more info see https://cloud.google.com/docs/authentication/getting-started
  
1. Import the Demo Agent, by creating a new CX agent, and import the *cx-demo.
json* file (from the agent create screen)


1. `gcloud services enable dialogflow.googleapis.com`

1. `gcloud init` to login and get the right permissions.

1. `cd back-end`

1. Install the required libraries:

    `npm install`

1. Start the node app:

   *You can see which values you will need to fill in, by looking into the URL bar of the Dialogflow CX console. Or clicking on the Agents Dropdown > View all agents.*

   For example:

   ```
    export LOCATION=global
    export PROJECT_ID=dialogflow-cx-demo-285510
    export AGENT_ID=6ef3e045-8c2f-4380-8559-0f0156ffc455
    npm run start
   ```

1. Browse to http://localhost:8080

1. start with: "Hi" and then "Which conversational tool should I use?"
