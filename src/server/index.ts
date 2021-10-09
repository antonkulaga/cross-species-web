/* eslint-disable no-use-before-define */
// const {ServerClient, ServerClientConfig} = require('graphdb').server;
import {Response} from "express-serve-static-core";
import {Request} from "express";
import express from "express"
import os from "os"
import {GraphRepository} from "./graph";
import {Gene, GeneResults, GeneSet, Orthology, Sample, SelectResults, Species} from "../shared/models";
import {string} from "prop-types";

const graph_db_host = process.env.GRAPH_DB || 'http://graphdb.agingkills.eu'
const graph_db_repository =process.env.GRAPH_REPO || "ensembl"
const repo = new GraphRepository(graph_db_host, graph_db_repository)

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

const getAllSpecies = async (): Promise<Array<Species>> => {
    return diskCache.wrap("species" /* cache key */, async () => {
        return await repo.species();
    });
}

app.get('/api/species', async (req, res, next) => {
    console.log('/api/species');
    const result = await getAllSpecies();
    res.send(result);
});


const getAllGenes = async (organism: string = 'Homo_sapiens'): Promise<Array<Gene>> => {
    return diskCache.wrap(organism /* cache key */, async () => {
        return await repo.referenceGenes(organism);
    });
}


app.get('/api/all_genes/:species', async (req, res, next) => {
    const organism = req.params.species || 'Homo_sapiens';
    console.log(`/api/all_genes/${req.params.species}`, organism);
    const result = await getAllGenes(organism)
    res.send(result);
});


app.post('/api/orthology', async (req, res , next) => {
    const {   reference_genes, species, orthologyTypes} = req.body;
    const results = await repo.orthology(reference_genes, species, orthologyTypes)
    res.send(results)
})

app.post('/api/orthology_table', async (req, res , next) => {
    const {   reference_genes, species, orthologyTypes} = req.body;
    const results = await repo.orthology_table(reference_genes, species, orthologyTypes)
    res.send(results)
})

app.post('/api/expressions', async (req, res, next) => {
    // console.log(req.body);
    const { runs, genes } = req.body;
    const result = await repo.expressions(runs, genes);
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
    let speciesObject = {};
    samples.forEach((sample) => {
        speciesObject[sample.organism] = true;
    });
    const species = Array.from<string>(Object.keys(speciesObject));
    const result = await repo.orthology(genes, species, ORTHOLOGY_TYPES.slice(0, 2));
    res.send(result);
});

const getAllSamples = async (): Promise<Array<Sample>> => {
    return diskCache.wrap("samples" /* cache key */, async () => {
        return await repo.samples();
    });
}

app.get('/api/samples', async (req, res, next) => {
    const result = await getAllSamples()
    res.send(result);
});

app.get("/api/gene_results", async (req, res, next) => {
    const result = await repo.ranked_results()

    res.send(result);
});

const getGeneSets = async (): Promise<Array<GeneSet>> => {
    return diskCache.wrap("gene_sets" /* cache key */, async () => {
        const selectResults6 = await repo.ranked_results(6)
        const result6 = selectResults6.map((value) =>GeneResults.fromBinding(value))
        const selectResults30 = await repo.ranked_results(30)
        const result30 = selectResults30.map((value) =>GeneResults.fromBinding(value))
        const genesOptions = [
            new GeneSet("ranked_results_6", "Top 6 results", result6.map(r=> r.asGene)),
            new GeneSet("ranked_results_30","Top 30 results", result30.map(r=>  r.asGene))
        ]
        return genesOptions
    });
}

app.get("/api/gene_sets", async (req, res, next) => {
    const genesOptions = await getGeneSets()
    res.send(genesOptions);
});


console.log( 'http://' + (process.env.HOST || '0.0.0.0') + ':' + (process.env.PORT || '8080'))

app.listen(process.env.PORT || 8080, () => console.log(`Listening in dev mode on port ${process.env.PORT || 8080}!`));
