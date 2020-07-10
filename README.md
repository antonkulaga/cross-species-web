# cross-species-web 

## How to run 
1. Run `npm install` to install all dependencies.
2. Run `npm dev` to start the app in dev mode or `npm start` to start it in production.
   
### Issues
1. By default the server is on port 8080 and the client on port 8081 but you can specify
`PORT=8082` `npm start` or any other value instead of 8082
2. By default the host is `0.0.0.0` but you can specify `HOST=localhost` `npm start`
3. Try `npm start-dev` or starting the server and client separately `npm server` / `npm client`

## Docker container ##
Building docker container is done by running:
```bash
bin/build-docker.sh
```
Running docker container:
```bash
bin/run-docker.sh
```

## How to run GraphDB

Install docker, go to cross-species-web/services and run:
```bash
docker-compose up
```
Check webinterface at http://localhost:7200/sparql
