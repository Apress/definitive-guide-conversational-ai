# Dialogflow custom integration

**by: Lee Boonstra, Developer Advocate Conversational AI, Google Cloud**

1. `gcloud services enable dialogflow.googleapis.com`

1. `gcloud init` to login and get the right permissions.

1. `cd back-end`

1. Download the service account key on your machine, which has access to your project: You can do this from the GCP console: IAM & Admin > Service Accounts. Take the account with the Dialogflow Integrations role, and create a JSON key. Store this somewhere save on your machine.

    In your terminal run:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/JSONkey

    For more info see https://cloud.google.com/docs/authentication/getting-started


1. Install the required libraries:

    `npm install`

1. Start the node app:

   `npm --PROJECT_ID=[your-gcp-project-id] run start`

1. Browse to http://localhost:3000