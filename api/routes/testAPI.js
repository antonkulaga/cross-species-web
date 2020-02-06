var express = require("express");
var fs = require('fs');
var Promise = require('bluebird');

var router = express.Router();
const samplesPath =  "././src/data/samples_values.json";
const genesProPath = "././src/data/genage_genes_pro.json";
const genesAntiPath = "././src/data/genage_genes_anti.jso";
const ensemblToNamePath = "././src/data/ensemblToName.json";
const allXValuesPath = "././src/data/allXValues.json";
const allYValuesPath = "././src/data/allYValues.json";
const genesExpressionPath = "././src/data/geneExpressions.json";

async function readFile(path){
	return new Promise(async resolve => {
		fs.readFile(path,'utf8', (err, data) => {
		if (err) console.log(err);
		  resolve(data);
		});
	});
}

router.get('/getSamples', async function(req, res, next) {
  var samples = await readFile(samplesPath);
  res.send(samples);
});

router.get('/getGenesPro', async function(req, res, next) {
  var result = await readFile(genesProPath);
  res.send(result);
});

router.get('/getGenesAnti', async function(req, res, next) {
  var result = await readFile(genesAntiPath);
  res.send(result);
});

router.get('/getEnsembleToName', async function(req, res, next) {
  var result = await readFile(ensemblToNamePath);
  res.send(result);
});

router.get('/getAllXValues', async function(req, res, next) {
  var result = await readFile(allXValuesPath);
  res.send(result);
});

router.get('/getAllYValues', async function(req, res, next) {
  var result = await readFile(allYValuesPath);
  res.send(result);
});

router.get('/getGeneExpression', async function(req, res, next) {
  var result = await readFile(genesExpressionPath);
  res.send(result);
});


router.get("/", function(req, res, next) {
    res.send("API is working properly");
});

module.exports = router;
