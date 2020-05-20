# cross-species-web 

## How to run 
1. Run `yarn install` to install all dependencies.
2. Run `yarn dev` to start the app in dev mode or `yarn start` to start it in production.
   
### Issues
1. By default the server is on port 8080 and the client on port 8081 but you can specify
`PORT=8082` `yarn start` or any other value instead of 8082
2. By default the host is `0.0.0.0` but you can specify `HOST=localhost` `yarn start`
3. Try `yarn start-dev` or starting the server and client separately `yarn server` / `yarn client`

## How to run GraphDB

Install docker, go to cross-species-web/services and run:
```bash
docker-compose up
```
Check webinterface at http://localhost:7200/sparql
