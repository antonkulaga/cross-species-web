const express = require('express');
const os = require('os');
const fs = require('fs');
const Promise = require('bluebird');

const samplesPath =  "./src/server/data/samples_values.json";
const genesProPath = "./src/server/data/genage_genes_pro.json";
const genesAntiPath = "./src/server/data/genage_genes_anti.json";
const ensemblToNamePath = "./src/server/data/ensemblToName.json";
const allXValuesPath = "./src/server/data/allXValues.json";
const allYValuesPath = "./src/server/data/allYValues.json";
const genesExpressionPath = "./src/server/data/geneExpressions.json";

const app = express();

async function readFile(path){
	console.log("path", path);
	return new Promise(async resolve => {
		fs.readFile( path,'utf8', (err, data) => {
		if (err) console.log("erro2", err);
		  resolve(data);
		});
	});
}

app.use(express.static('dist'));

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

app.get('/api/getSamples', async function(req, res, next) {
  console.log("getSamples app");
  var samples = await readFile(samplesPath);
  res.send(samples);
});

app.get('/api/getGenesPro', async function(req, res, next) {
  var result = await readFile(genesProPath);
  res.send(result);
});

app.get('/api/getGenesAnti', async function(req, res, next) {
  var result = await readFile(genesAntiPath);
  res.send(result);
});

app.get('/api/getEnsembleToName', async function(req, res, next) {
  var result = await readFile(ensemblToNamePath);
  res.send(result);
});

app.get('/api/getAllXValues', async function(req, res, next) {
  var result = await readFile(allXValuesPath);
  res.send(result);
});

app.get('/api/getAllYValues', async function(req, res, next) {
  var result = await readFile(allYValuesPath);
  res.send(result);
});

app.get('/api/getGeneExpression', async function(req, res, next) {
  var result = await readFile(genesExpressionPath);
  res.send(result);
});



app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
