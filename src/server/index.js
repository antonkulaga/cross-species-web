/* eslint-disable no-use-before-define */
// const {ServerClient, ServerClientConfig} = require('graphdb').server;
const express = require('express');
const os = require('os');
const fs = require('fs');
const Promise = require('bluebird');

const graphdb = require('graphdb');

const genesProPath = './src/server/data/genage_genes_pro.json';
const genesAntiPath = './src/server/data/genage_genes_anti.json';
const genesYspeciesProPath = './src/server/data/yspecies_pro.json';
const genesYspeciesTopPath = './src/server/data/yspecies_top_pro_anti.json';

const allXValuesPath = './src/server/data/allXValues.json';
const allYValuesPath = './src/server/data/allYValues.json';
const genesExpressionPath = './src/server/data/geneExpressions.json';

const ORTHOLOGY_TYPES = [
  'ens:ortholog_one2one',
  'ens:ortholog_one2many',
  'ens:ortholog_many2many'
];


const graph = require( __dirname + '/graph.js');
const repo = new graph.GraphRepository()

const app = express();

const cacheManager = require('cache-manager');
const fsStore = require('cache-manager-fs-hash');

const diskCache = cacheManager.caching({
  store: fsStore,
  options: {
    path: __dirname +'/data/cache', //path for cached files
    ttl: 60 * 60 * 24 * 4,      //time to life in seconds
    subdirs: true,     //create subdirectories to reduce the
    //files in a single dir (default: false)
    zip: false,         //zip files to save diskspace (default: false)
  }
});




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
app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.raw());

app.get('/api/username', (req, res) => res.send({ username: os.userInfo().username }));
app.get('/api/predefined_genes', async (req, res, next) => {

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

const getAllGenes = async (organism = 'Homo_sapiens') => {
  return diskCache.wrap(organism /* cache key */, async () => {
    return await repo.queryReferenceOrgGenes(organism);
  });
}

app.get('/api/all_genes/:species', async (req, res, next) => {
  const organism = req.params.species || 'Homo_sapiens';
  console.log(`/api/all_genes/${req.params.species}`, organism);
  const result = await getAllGenes(organism)
  res.send(result);
});

app.post('/api/orthology_table', async (req, res , next) => {
  const {   reference_genes, species, orthologyTypes} = req.body;
  const results = await repo.orthology_table(reference_genes, species, orthologyTypes)
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
