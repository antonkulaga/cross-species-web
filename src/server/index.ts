/* eslint-disable no-use-before-define */
// const {ServerClient, ServerClientConfig} = require('graphdb').server;
import {Response} from "express-serve-static-core";
import {Request} from "express";
import express from "express"
import os from "os"

const graph = require( __dirname + '/graph.js');
const repo = new graph.GraphRepository(process.env.GRAPH_DB || 'http://agingkills.eu:7200/repositories/ensembl')

const app = express();
app.use(express.static('dist'));
app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.raw());


app.get("/api/test", (req: Request, res: Response) =>{
        console.log('the server is working! api/test');
        res.send("<h1> The server is working! api/test</h1>")
    }
)

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

app.get('/api/username', (req, res) => res.send({ username: os.userInfo().username }));

app.get('/api/species', async (req, res, next) => {
    console.log('/api/species');
    const result = await repo.querySpecies();
    res.send(result);
});


const getAllGenes = async (organism: string = 'Homo_sapiens') => {
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

app.post('/api/expressions', async (req, res, next) => {
    // console.log(req.body);
    const { runs, genes } = req.body;
    const result = await repo.queryExpressions(runs, genes);
    console.log('/api/expressions');//, genes, species, result);
    res.send(result);
});


const ORTHOLOGY_TYPES = [
    'ens:ortholog_one2one',
    'ens:ortholog_one2many',
    'ens:ortholog_many2many'
];

app.post('/api/orthology_one2many', async (req, res, next) => {
    console.log("/api/orthology_one2many", req.body);
    const { genes, samples } = req.body;
    // const species = JSON.parse(req.query.species);// , "ENSG00000139990", "ENSG00000073921"]');
    let species = {};
    samples.forEach((sample) => {
        species[sample.organism] = true;
    });
    species = Object.keys(species);
    const result = await repo.queryOrthology(genes, species, ORTHOLOGY_TYPES.slice(0, 2));
    res.send(result);
});

app.get('/api/samples', async (req, res, next) => {
    const result = await repo.querySamples();
    res.send(result);
});

app.get("/api/gene_sets", async (req, res, next) => {
    const result = await repo.get
    res.send(result);
});


console.log( 'http://' + (process.env.HOST || '0.0.0.0') + ':' + (process.env.PORT || '8080'))

app.listen(process.env.PORT || 8080, () => console.log(`Listening in dev mode on port ${process.env.PORT || 8080}!`));
