# cross-species-web 

## About the app
Actually, there are two separated apps. The Client which serves the FrontEnd (using React), and the API (in Node/Express).

## How to run the API
1. In your terminal, navigate to the `api` directory.
2. Run `npm install` to install all dependencies.
3. Run `npm start` to start the app.

## How to run the Client
1. In another terminal, navigate to the `client` directory.
2. Run `np7200m install` to install all dependencies.
3. Run `npm start` to start the app

## How to run GraphDB

Install docker, go to cross-species-web/services and run:
```bash
docker-compose up
```
Check webinterface at http://localhost:7200/sparql

## Check if they are connected
With the two apps running, open your browser in http://localhost:3000/.
