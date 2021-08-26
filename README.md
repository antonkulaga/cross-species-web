# cross-species-web 

### with yarn ###

Install all dependencies according to the instructions on the bottom of readme.

Run `yarn dev`

```bash
HOST=0.0.0.0 yarn dev
```

## with docker container ###

```bash
bin/run-docker.sh
```

## Troubleshooting
Try to run the server and client separately.

Choose PORT and HOST

```bash
yarn server
```
and in another terminal
```bash
yarn client
```
## Installing dependencies ##

### Linux ###

The project depends on nodejs and yarn. Note: official software sources of Linux distributions rely on outdated versions of node and yarn
The easiest way to install latest nodejs is using https://github.com/nvm-sh/nvm
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
nvm install node
```
Then install yarn and use it for dependencies resolution:
```bash
npm install -g yarn
yarn install
```

## Docker container ##
Building docker container is done by running build bash script from the root folder of the project:
```bash
bin/build-docker.sh
```
or alternatively you can:
```bash
docker build -t quay.io/comp-bio-aging/cross_species_web:latest -f docker/Dockerfile .
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
