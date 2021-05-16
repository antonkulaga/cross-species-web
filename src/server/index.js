/* eslint-disable no-use-before-define */
// const {ServerClient, ServerClientConfig} = require('graphdb').server;
const express = require('express');
const os = require('os');
const fs = require('fs');
const Promise = require('bluebird');

const graphdb = require('graphdb');

const { RDFMimeType } = graphdb.http;
const { RepositoryClientConfig, RDFRepositoryClient } = graphdb.repository;


// const serverConfig = new ServerClientConfig('http://10.40.3.21:7200/', 0, {
//     'Accept': RDFMimeType.SPARQL_RESULTS_JSON
// });
// const gDbServer = new ServerClient(serverConfig);
const readTimeout = 30000;
const writeTimeout = 30000;
const config = new RepositoryClientConfig(['http://10.40.3.21:7200/repositories/ensembl'], {
  Accept: RDFMimeType.SPARQL_RESULTS_JSON
}, '', readTimeout, writeTimeout);
const repository = new RDFRepositoryClient(config);

const genesProPath = './src/server/data/genage_genes_pro.json';
const genesAntiPath = './src/server/data/genage_genes_anti.json';
const genesYspeciesProPath = './src/server/data/yspecies_pro.json';
const genesYspeciesTopPath = './src/server/data/yspecies_top_pro_anti.json';

const ensemblToNamePath = './src/server/data/ensemblToName.json';
const allXValuesPath = './src/server/data/allXValues.json';
const allYValuesPath = './src/server/data/allYValues.json';
const genesExpressionPath = './src/server/data/geneExpressions.json';

const RDF_PREFIX = 'http://rdf.ebi.ac.uk/resource/ensembl/'.length;
const SRA_PREFIX = 'https://www.ncbi.nlm.nih.gov/sra/'.length;
const BIOPROJECT_PREFIX = 'https://www.ncbi.nlm.nih.gov/bioproject/'.length;
const LAB_RESOURCE_PREFIX = 'http://aging-research.group/resource/'.length;
const ORTHOLOGY_TYPES = [
  'ens:ortholog_one2one',
  'ens:ortholog_one2many',
  'ens:ortholog_many2many'
];

let cachedHumanGenes = null;

const graph = require( __dirname + '/graph.js');
const repo = new graph.GraphRepository()

const app = express();

async function readFile(path) {
  console.log('path', path);
  return new Promise(async (resolve) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) console.log('erro2', err);
      resolve(data);
    });
  });
}

app.use(express.static('dist'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.raw());

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
app.get('/api/getPredefinedGenes', async (req, res, next) => {

  const genes_pro = await readFile(genesProPath);
  const genes_anti = await readFile(genesAntiPath);
  const YspeciesGenesTop = await readFile(genesYspeciesTopPath);
  const YspeciesGenesPro = await readFile(genesYspeciesProPath);
  const result =
      [
        {
          "key": "genes_pro",
          "value": "genes_pro",
          "text": "Pro Longevity Genes",
          "genes": JSON.parse(genes_pro)
        },
        {
          "key": "genes_anti",
          "value": "genes_pro",
          "text": "Anti longevity genes",
          "genes": JSON.parse(genes_anti)
        },
        {
          "key": "yspecies_genes_pro",
          "value": "yspecies_genes_pro",
          "text": "Top pro longevity genes selected in the cross-species paper",
          "genes": JSON.parse(YspeciesGenesTop)
        },
        {
          "key": "yspecies_gene_top",
          "value": "yspecies_gene_top",
          "label": "Top genes selected in cross-species research paper",
          "genes": JSON.parse(YspeciesGenesPro)
        }
      ]
  res.send(result);
});


app.get('/api/getEnsembleToName', async (req, res, next) => {
  const result = await readFile(ensemblToNamePath);
  res.send(result);
});

app.get('/api/getAllXValues', async (req, res, next) => {
  const result = await readFile(allXValuesPath);
  res.send(result);
});

app.get('/api/getAllYValues', async (req, res, next) => {
  const result = await readFile(allYValuesPath);
  res.send(result);
});

app.get('/api/getGeneExpression', async (req, res, next) => {
  const result = await readFile(genesExpressionPath);
  res.send(result);
});

app.get('/api/getSpecies', async (req, res, next) => {
  console.log('/api/getSpecies');
  const result = await repo.querySpecies();
  res.send(result);
});

app.get('/api/getReferenceOrgGenes', async (req, res, next) => {
  const referenceOrg = req.query.referenceOrg || 'Homo_sapiens';
  console.log('/api/getReferenceOrgGenes', referenceOrg);
  if(referenceOrg === "Homo_sapiens" && cachedHumanGenes != null){
    const result = cachedHumanGenes;
    console.log("has cache");
    res.send(result);
  } else {
    const result = await repo.queryReferenceOrgGenes(referenceOrg);
    if(referenceOrg === "Homo_sapiens" && cachedHumanGenes == null){
      cachedHumanGenes = result;
      console.log("no cache");
    }
    // console.log(result);
    res.send(result);
  }
});

app.post('/api/getOrthologyOne2One', async (req, res, next) => {
  console.log(req.body);
  const { genes, samples } = req.body;
  // const species = JSON.parse(req.query.species);// , "ENSG00000139990", "ENSG00000073921"]');
  let species = {};
  samples.forEach((sample) => {
    species[sample.organism] = true;
  });
  species = Object.keys(species);
  const result = await repo.queryOrthology(genes, species, ORTHOLOGY_TYPES.slice(0, 1));
  console.log('/api/getOrthologyOne2One');//, genes, species, result);
  res.send(result);
});

app.post('/api/getOrthology', async (req, res , next) => {
  const {   reference_genes, species, orthologyTypes} = req.body;
  const results = await repo.queryOrthology(reference_genes, species, orthologyTypes)
  res.send(results)
})

app.post('/api/getExpressions', async (req, res , next) => {
  const { genes, samples } = req.body;
})

app.post('/api/getOrthologyOne2Many', async (req, res, next) => {
  console.log("/api/getOrthologyOne2Many", req.body);
  const { genes, samples } = req.body;
  // const species = JSON.parse(req.query.species);// , "ENSG00000139990", "ENSG00000073921"]');
  let species = {};
  samples.forEach((sample) => {
    species[sample.organism] = true;
  });
  species = Object.keys(species);
  const result = await repo.queryOrthology(genes, species, ORTHOLOGY_TYPES.slice(0, 2));
  console.log('/api/getOrthologyOne2One');//, genes, species, result);
  res.send(result);
});

/*
app.post('/api/getOrthologyAll', async (req, res, next) => {
  const genes = JSON.parse(req.query.genes || '["ENSG00000242265"]');// , "ENSG00000139990", "ENSG00000073921"]'); //WHAT IS THAT???
  const species = JSON.parse(req.query.species || '["Homo_sapiens"]');// , "ENSG00000139990", "ENSG00000073921"]');
  const result = await repo.queryOrthology(genes, species, ORTHOLOGY_TYPES);
  console.log(result);
  res.send(result);
});
*/

app.get('/api/getSamples', async (req, res, next) => {
  const result = await repo.querySamples();
  res.send(result);
});

app.post('/api/getExpressions', async (req, res, next) => {
  // console.log(req.body);
  const { runs, genes } = req.body;
  const result = await repo.queryExpressions(runs, genes);
  console.log('/api/getExpressions');//, genes, species, result);
  res.send(result);
});

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
