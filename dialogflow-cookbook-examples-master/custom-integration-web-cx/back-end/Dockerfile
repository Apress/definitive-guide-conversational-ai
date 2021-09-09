FROM node:latest

LABEL maintainer="Lee Boonstra"

WORKDIR /app

COPY package.json /app
COPY app.js /app
COPY ui /app/ui
COPY app.yaml /app

RUN rm -rf package-lock.json && npm install
RUN npm install pm2 -g

ADD @google-cloud /app/node_modules/@google-cloud

ENV LOCATION global
ENV PROJECT_ID dialogflow-cx-demo-285510
ENV AGENT_ID 6ef3e045-8c2f-4380-8559-0f0156ffc455 

EXPOSE 8080

CMD ["pm2-runtime", "/app/app.js"]