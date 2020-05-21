/* eslint-disable no-use-before-define */
// const {ServerClient, ServerClientConfig} = require('graphdb').server;
const express = require('express');
const os = require('os');
const fs = require('fs');
const Promise = require('bluebird');
const graphdb = require('graphdb');
const bodyParser = require('body-parser');

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
const ensemblToNamePath = './src/server/data/ensemblToName.json';
// const allXValuesPath = './src/server/data/allXValues.json';
// const allYValuesPath = './src/server/data/allYValues.json';
// const genesExpressionPath = './src/server/data/geneExpressions.json';

const RDF_PREFIX = 'http://rdf.ebi.ac.uk/resource/ensembl/'.length;
const SRA_PREFIX = 'https://www.ncbi.nlm.nih.gov/sra/'.length;
const BIOPROJECT_PREFIX = 'https://www.ncbi.nlm.nih.gov/bioproject/'.length;
const LAB_RESOURCE_PREFIX = 'http://aging-research.group/resource/'.length;
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

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

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

app.get('/api/getSpecies', async (req, res, next) => {
  console.log('/api/getSpecies');
  const result = await querySpecies();
  res.send(result);
});

app.get('/api/getReferenceOrgGenes', async (req, res, next) => {
  const referenceOrg = req.query.referenceOrg || 'Homo_sapiens';
  console.log('/api/getReferenceOrgGenes', referenceOrg);
  const result = await queryReferenceOrgGenes(referenceOrg);
  // console.log(result);
  res.send(result);
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
  const result = await queryOrthology(genes, species, ORTHOLOGY_TYPES.slice(0, 1));
  console.log('/api/getOrthologyOne2One');//, genes, species, result);
  res.send(result);
});

app.post('/api/getOrthologyOne2Many', async (req, res, next) => {
  console.log("/api/getOrthologyOne2Many", req.body);
  const { genes, samples } = req.body;
  // const species = JSON.parse(req.query.species);// , "ENSG00000139990", "ENSG00000073921"]');
  let species = {};
  samples.forEach((sample) => {
    species[sample.organism] = true;
  });
  species = Object.keys(species);
  const result = await queryOrthology(genes, species, ORTHOLOGY_TYPES.slice(0, 2));
  console.log('/api/getOrthologyOne2One');//, genes, species, result);
  res.send(result);
});

app.post('/api/getOrthologyAll', async (req, res, next) => {
  const genes = JSON.parse(req.query.genes || '["ENSG00000242265"]');// , "ENSG00000139990", "ENSG00000073921"]');
  const species = JSON.parse(req.query.species || '["Homo_sapiens"]');// , "ENSG00000139990", "ENSG00000073921"]');
  const result = await queryOrthology(genes, species, ORTHOLOGY_TYPES);
  console.log(result);
  res.send(result);
});

app.get('/api/getSamples', async (req, res, next) => {
  const result = await querySamples();
  console.log('/api/getSamples');
  res.send(result);
});

app.post('/api/getExpressions', async (req, res, next) => {
  // console.log(req.body);
  const { runs, genes } = req.body;
  const result = await queryExpressions(runs, genes);
  console.log('/api/getExpressions');//, genes, species, result);
  res.send(result);
});

async function queryExpressions(runs, genes) {
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const query = `PREFIX samples:<http://aging-research.group/samples/>
    PREFIX sra: <https://www.ncbi.nlm.nih.gov/sra/>

    SELECT * WHERE
    {
      values ?run { sra:${runs.join(' sra:')} }
      values ?expression { samples:has_${genes.join('_expression samples:has_')}_expression } .
      ?run ?expression ?tpm .
    }`;
  // console.log(query)
  const payload = new graphdb.query.GetQueryPayload()
    .setQuery(query)
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload).then(stream => new Promise((resolve, reject) => {
    const expressions = [];
    stream.on('data', (bindings) => {
      expressions.push({
        run: bindings.run.id.slice('https://www.ncbi.nlm.nih.gov/sra/'.length),
        gene: bindings.expression.id.split('_')[1],
        tpm: getNumberFromRDF(bindings.tpm.id)
      })
    });
    stream.on('end', () => {
      // handle end of the stream
      resolve(expressions);
    });
  }));
}

async function querySamples() {
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const payload = new graphdb.query.GetQueryPayload()
    .setQuery(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
      PREFIX samples:<http://aging-research.group/samples/>
      PREFIX : <http://aging-research.group/resource/>
      
      SELECT * WHERE
      {
          ?bioproject rdf:type samples:Bioproject . #gets all bioprojects
          ?bioproject samples:has_series ?series .
          ?series samples:has_run ?run . #gets sequencing runs from experimental series
          ?run samples:has_organism ?organism . #species
          ?run samples:has_sample_name ?sample_name .
          ?run samples:has_characteristics ?characterists .    
          ?run samples:has_sequencer ?sequencer .    
          ?run samples:has_age ?age .
          ?run samples:has_sex ?sex .
          ?run samples:has_tumor ?tumor .    
          ?run samples:has_source ?source .    
          ?run samples:has_study ?study .
          ?run samples:has_study_title ?study_title .            
          ?run samples:has_salmon_version ?salmon_version .
          ?run samples:has_library_layout ?library_layout .
          ?run samples:has_library_selection ?library_selection .
          ?run samples:has_library_strategy ?library_strategy .
          ?run samples:has_libType ?lib_type .
          ?run samples:has_numBootstraps ?bootstrap .
          ?run samples:has_modified ?modified .
          ?run samples:has_protocol ?protocol .
      } ORDER BY ?organism ?bioproject ?series ?run
    `)
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload).then(stream => new Promise((resolve, reject) => {
    const samples = [];
    stream.on('data', (bindings) => {
      // the bindings stream converted to data objects with the registered parser
      // console.log('@@', bindings);
      samples.push({
        // study_title: bindings.study_title.id,
        // library_layout: bindings.library_layout.id,
        // study: bindings.study.id,
        organism: bindings.organism.id.slice(LAB_RESOURCE_PREFIX),
        sex: bindings.sex.id.replace(/"/g, ''),
        run: bindings.run.id.slice(SRA_PREFIX),
        // characterists: bindings.characterists.id,
        source: bindings.source.id.replace(/"/g, ''),
        // bootstrap: bindings.bootstrap.id,
        // library_strategy: bindings.library_strategy.id,
        // lib_type: bindings.lib_type.id,
        sequencer: bindings.sequencer.id.slice(LAB_RESOURCE_PREFIX),
        bioproject: bindings.bioproject.id.slice(BIOPROJECT_PREFIX),
        // protocol: bindings.protocol.id,
        // series: bindings.series.id,
        // tumor: bindings.tumor.id,
        // modified: bindings.modified.id,
        // salmon_version: bindings.salmon_version.id,
        // library_selection: bindings.library_selection.id,
        // age: bindings.age.id,
        // sample_name: bindings.sample_name.id
      });
    });
    stream.on('end', () => {
      // handle end of the stream
      resolve(samples);
    });
  }));
}

async function queryOrthology(genes, species, orthologyTypes) {
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());
  
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
  PREFIX : <http://aging-research.group/resource/>
  
  SELECT ?selected_genes ?selected_species ?orthology ?ortholog ?target_species ?common_name ?ortholog_gene   WHERE { 
      values ?target_species { :${species.join(' :')} }    #put species selected by the user (info from selected samples)
      values ?selected_genes { ens:${genes.join(' ens:')} }
      ?selected_species :has_gene ?selected_genes .   

      values ?orthology { ${orthologyTypes.join(' ')} }
      ?selected_genes ?orthology ?ortholog .   

      OPTIONAL { ?ortholog rdfs:label ?ortholog_gene . }

      ?target_species :has_gene ?ortholog .
      ?target_species :has_common_name ?common_name .
  } ORDER BY ?selected_genes ?ortholog ?species`;
  // console.log(query)
  const payload = new graphdb.query.GetQueryPayload()
    .setQuery(query)
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload).then(stream => new Promise((resolve, reject) => {
    const orthology = {};
    stream.on('data', (bindings) => {
      // the bindings stream converted to data objects with the registered parser
      // console.log(bindings)
      if (!orthology[bindings.selected_genes.id.slice(RDF_PREFIX)]) {
        orthology[bindings.selected_genes.id.slice(RDF_PREFIX)] = [];
      }
      orthology[bindings.selected_genes.id.slice(RDF_PREFIX)].push({
        ortholog_id: bindings.ortholog.id.slice(RDF_PREFIX),
        ortholog_species: bindings.target_species.id.slice(LAB_RESOURCE_PREFIX),
        orthology: bindings.orthology.id.slice(RDF_PREFIX),
        ortholog_symbol: (bindings.ortholog_gene || {id:''}).id.replace(/"/g, ''),
        ortholog_common_name: bindings.common_name.id.replace(/"/g, '')
      });
    });
    stream.on('end', () => {
      // handle end of the stream
      console.log(orthology)
      resolve(orthology);
    });
  }));
}

async function queryReferenceOrgGenes(referenceOrg) {
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const payload = new graphdb.query.GetQueryPayload()
    .setQuery(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
      PREFIX : <http://aging-research.group/resource/>
      
      SELECT ?species ?gene ?symbol WHERE { 
          values ?species { :${referenceOrg} } . #put your species of interest instead of Homo_sapiens   
          ?gene rdfs:label ?symbol .
          ?species :has_gene ?gene .
      }
    `)
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

function getNumberFromRDF(str) {
  return str.split('^^')[0].replace(/"/g, '');
}

async function querySpecies() {
  // const payload = new GetStatementsPayload()
  //   .setResponseType(RDFMimeType.RDF_JSON)
  //   .setSubject('?species')
  //   .setPredicate('<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>')
  //   .setObject('<http://aging-research.group/resource/species>')
  //   .setContext('.')
  //   .setInference(true);
  repository.registerParser(new graphdb.parser.SparqlJsonResultParser());

  const payload = new graphdb.query.GetQueryPayload()
    // .setQuery('SELECT ?species ?common_name WHERE { ?species <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://aging-research.group/resource/Species> . \n ?species <http://aging-research.group/resource/has_common_name> ?common_name .}')
    .setQuery(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
      PREFIX : <http://aging-research.group/resource/>
      
      SELECT * WHERE {     
            ?species :has_common_name ?common_name .
            ?species :has_ensembl_url ?ensembl_url .
            ?species :is_animal_class ?animal_class .
            ?species :has_lifespan ?lifespan .
            ?species :has_mass_g ?mass_g .
            ?species :has_metabolic_rate ?metabolic_rate .
            ?species :has_taxon ?taxon . 
            ?species :has_temperature_kelvin ?temperature_kelvin .
          ?species rdf:type :Species .
      }
    `)
    .setQueryType(graphdb.query.QueryType.SELECT)
    .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    // .setLimit(100);

  return repository.query(payload)
    .then(stream => new Promise((resolve, reject) => {
      const speciesNames = [];
      stream.on('data', (bindings) => {
        // the bindings stream converted to data objects with the registered parser
        // console.log('@@', bindings);
        speciesNames.push({
          id: bindings.species.id.slice(LAB_RESOURCE_PREFIX),
          common_name: bindings.common_name.id.replace(/"/g, ''),
          mass_g: getNumberFromRDF(bindings.mass_g.id),
          ensembl_url: bindings.ensembl_url.id,
          lifespan: getNumberFromRDF(bindings.lifespan.id),
          metabolic_rate: getNumberFromRDF(bindings.metabolic_rate.id),
          temperature_kelvin: getNumberFromRDF(bindings.temperature_kelvin.id),
          animal_class: bindings.animal_class.id,
          taxon: bindings.taxon.id.slice('http://rdf.ebi.ac.uk/resource/ensembl/taxon#'.length)
        });
      });
      stream.on('end', () => {
        // handle end of the stream
        resolve(speciesNames);
      });
    }))
    .catch(err => console.error(err))

  // return repository.get(payload)
  //   .then(data =>
  //     // data contains requested staments in rdf json format
  //     data
  //   )
  //   .catch(error => console.error(error))
}

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
