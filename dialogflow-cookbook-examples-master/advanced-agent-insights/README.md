# Dialogflow advanced analytics with Pub/Sub, DLP, Cloud Functions and BigQuery

**by: Lee Boonstra, Developer Advocate Conversational AI, Google Cloud**

1. `gcloud services enable bigquery-json.googleapis.com \
  cloudfunctions.googleapis.com \
  dlp.googleapis.com \
  language.googleapis.com`

1. **IAM & Admin > IAM**
    Find the Dialogflow Service Account, which is used by Dialogflow. (You can find this in the Dialogflow > Settings > General page), and click edit.

    Give your service accounts the following permissions:
    * BigQuery Data Owner
    * BigQuery Job User
    * Pub/Sub Admin

1. `gcloud init` to login and get the right permissions.

1. `cd back-end`

1. Install the required libraries:

    `npm install`

1. **Cloud Functions > Create Function**
    Name: chatanalytics
    Memory allocated: 256MB
    Trigger: Cloud Pub/Sub
    Pub/Sub topic: projects/[project_id]/topics/chatbotanalytics
    Function to execute: subscribe\
    Environment Variables:
    GCLOUD_PROJECT - [project_id]

    Use the contents of **cloudfunctions/index.js** and **cloudfunctions/package.json**

1. Start the node app:

   `npm --PROJECT_ID=[your-gcp-project-id] run start`

1. Browse to http://localhost:3000


1. Go to BigQuery: https://console.cloud.google.com/bigquery?

    Click (underneath the resources): **project > chatanalytics > chatmessages** 
    Press **Preview** and from one of the preview rows, copy the session id, which you can use
    in the SQL query below.

    Then use this Query to retrieve a transcript:

    ```
    SELECT * FROM `[project_id].chatanalytics.chatmessages` WHERE SESSION='[session-id]' ORDER BY POSTED LIMIT 
    ```