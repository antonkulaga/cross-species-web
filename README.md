# cross-species-web 

## How to run 

### with yarn ###

1. Run `yarn install` to install all dependencies.
2. Run `yarn dev`

## locally
```bash
PORT=8084 HOST=localhost yarn dev
```
## remotely
```bash
PORT=8084 HOST=0.0.0.0 yarn dev
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
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
nvm install v14.5.0
```
To install yarn:
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install --no-install-recommends yarn
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
