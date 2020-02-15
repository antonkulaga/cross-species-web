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


const samplesPath = './src/server/data/samples_values.json';
const genesProPath = './src/server/data/genage_genes_pro.json';
const genesAntiPath = './src/server/data/genage_genes_anti.json';
const ensemblToNamePath = './src/server/data/ensemblToName.json';
const allXValuesPath = './src/server/data/allXValues.json';
const allYValuesPath = './src/server/data/allYValues.json';
const genesExpressionPath = './src/server/data/geneExpressions.json';

const RDF_PREFIX = 'http://rdf.ebi.ac.uk/resource/ensembl/'.length;
const ORTHOLOGY_TYPES = [
  'ens:ortholog_one2one',
  'ens:ortholog_one2many',
  'ens:ortholog_many2many'
];

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

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

app.get('/api/getSamples', async (req, res, next) => {
  console.log('getSamples app');
  const samples = await readFile(samplesPath);
  res.send(samples);
});

app.get('/api/getGenesPro', async (req, res, next) => {
  const result = await readFile(genesProPath);
  res.send(result);
});

app.get('/api/getGenesAnti', async (req, res, next) => {
  const result = await readFile(genesAntiPath);
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

app.get('/api/getSpeciesNames', async (req, res, next) => {
  const result = await querySpeciesNames();
  console.log(result);
  res.send(result);
});

app.get('/api/getReferenceOrgGenes', async (req, res, next) => {
  const referenceOrg = req.query.referenceOrg || 'http://aging-research.group/resource/Homo_sapiens';
  const result = await queryReferenceOrgGenes(referenceOrg);
  console.log(result);
  res.send(result);
});

app.post('/api/getOrthologyOne2One', async (req, res, next) => {
  const genes = JSON.parse(req.query.genes || '["ENSG00000242265"]')//, "ENSG00000139990", "ENSG00000073921"]');
  const result = await queryOrthology(genes, ORTHOLOGY_TYPES.slice(0,1))
  console.log(result);
  res.send(result);
});

app.post('/api/getOrthologyAll', async (req, res, next) => {
  const genes = JSON.parse(req.query.genes || '["ENSG00000242265"]')//, "ENSG00000139990", "ENSG00000073921"]');
  const result = await queryOrthology(genes, ORTHOLOGY_TYPES);
  console.log(result);
  res.send(result);
});

async function queryOrthology(genes, orthologyTypes) {
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const payload = new graphdb.query.GetQueryPayload()
    .setQuery(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
              PREFIX : <http://aging-research.group/resource/>
              
              SELECT ?selected_genes ?selected_species ?orthology ?ortholog ?species  ?common_name ?ortholog_gene   WHERE { 
                  values ?selected_genes { ens:${genes.join(' ens:')} }
                  ?selected_species :has_gene ?selected_genes .    
                  GRAPH <http://rdf.ebi.ac.uk/resource/ensembl/confidence/high> {    
                      values ?orthology { ${orthologyTypes.join(' ')} }
                      ?selected_genes ?orthology ?ortholog .   
                  }
                ?ortholog rdfs:label ?ortholog_gene .
                  ?species :has_gene ?ortholog .
                  ?species :has_common_name ?common_name .
              } ORDER BY ?selected_genes ?ortholog ?species`)
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload).then(stream => new Promise((resolve, reject) => {
    const orthology = [];
    stream.on('data', (bindings) => {
      // the bindings stream converted to data objects with the registered parser
      // console.log('@@', bindings);
      if (!orthology[bindings.selected_genes.id.slice(RDF_PREFIX)]) {
        orthology[bindings.selected_genes.id.slice(RDF_PREFIX)] = [];
      }
      orthology[bindings.selected_genes.id.slice(RDF_PREFIX)].push({
        ortholog_id: bindings.ortholog.id.slice(RDF_PREFIX),
        ortholog_species: bindings.species.id,
        orthology: bindings.orthology.id,
        ortholog_symbol: bindings.ortholog_gene.id,
        ortholog_common_name: bindings.common_name.id
      });
    });
    stream.on('end', () => {
      // handle end of the stream
      resolve(orthology);
    });
  }));
}

async function queryReferenceOrgGenes(referenceOrg) {
  console.log(referenceOrg);
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const payload = new graphdb.query.GetQueryPayload()
    .setQuery(`SELECT ?gene ?symbol WHERE { values ?species { <${referenceOrg}> } . \n ?gene <http://www.w3.org/2000/01/rdf-schema#label> ?symbol . \n ?species <http://aging-research.group/resource/has_gene> ?gene .}`)
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload).then(stream => new Promise((resolve, reject) => {
    const genes = [];
    stream.on('data', (bindings) => {
      // the bindings stream converted to data objects with the registered parser
      // console.log('@@', bindings);
      genes.push({
        symbol: bindings.symbol.id.replace(/"/g, ''),
        ensembl_id: bindings.gene.id
      });
    });
    stream.on('end', () => {
      // handle end of the stream
      resolve(genes);
    });
  }));
}

async function querySpeciesNames() {
  // const payload = new GetStatementsPayload()
  //   .setResponseType(RDFMimeType.RDF_JSON)
  //   .setSubject('?species')
  //   .setPredicate('<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>')
  //   .setObject('<http://aging-research.group/resource/species>')
  //   .setContext('.')
  //   .setInference(true);
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const payload = new graphdb.query.GetQueryPayload()
    .setQuery('SELECT ?species ?common_name WHERE { ?species <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://aging-research.group/resource/Species> . \n ?species <http://aging-research.group/resource/has_common_name> ?common_name .}')
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload).then(stream => new Promise((resolve, reject) => {
    const speciesNames = [];
    stream.on('data', (bindings) => {
      // the bindings stream converted to data objects with the registered parser
      // console.log('@@', bindings.common_name.id);
      speciesNames.push({
        id: bindings.species.id,
        common_name: bindings.common_name.id.replace(/"/g, '')
      });
    });
    stream.on('end', () => {
      // handle end of the stream
      resolve(speciesNames);
    });
  }));

  // return repository.get(payload)
  //   .then(data =>
  //     // data contains requested staments in rdf json format
  //     data
  //   )
  //   .catch(error => console.error(error))
}


app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
