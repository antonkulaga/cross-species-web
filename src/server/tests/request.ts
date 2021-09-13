const graph = require('../graph.js');
const repo = new graph.GraphRepository("" +
    "http://graphdb.agingkills.eu/repositories/ensembl")

//const requestString = `{"reference_genes":["ENSG00000164362","ENSG00000084676"],"species":["Homo_sapiens","Gopherus_agassizii","Gorilla_gorilla"],"orthologyTypes":["ens:ortholog_one2one","ens:ortholog_one2many"]}`
//const request = JSON.parse(requestString)
//console.log("request:", request)
//const {   reference_genes, species, orthologyTypes} = request;

let hello: string = "test"

console.log(repo.results_ranked_genes_query_string(6))
const results = repo.ranked_results(6)
results.then( (res: object)  =>{
        console.log("RESULTS:", JSON.stringify(res,null, 2))
        console.log("TODO: make proper test for orthology_table")
    }
)