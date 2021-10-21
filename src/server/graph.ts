import * as graphdb from "graphdb"
import "immutable"
import {fromJS, OrderedMap, Seq, List, Collection} from "immutable";
import * as Query from "./queries"
import {
    SelectResults,
    Species,
    StringMap,
    Sample,
    Orthology,
    Expressions,
    Gene,
    GeneResults
} from "../shared/models"
import {Term, Literal, NamedNode, BlankNode} from "n3";
const {RDFMimeType} = graphdb.http;
const {RepositoryClientConfig, RDFRepositoryClient} = graphdb.repository

/**
 * Class that interactions with GRAPHDB and makes queries to it
 */
export class GraphRepository {

    config: RepositoryClientConfig
    repository: RDFRepositoryClient

    constructor(endpoint: string = "http://graphdb.agingkills.eu", repository: string = "ensembl", readTimeout: number = 50000, writeTimeout: number = 50000) {
        const url = `${endpoint}/repositories/${repository}`
        this.config = new RepositoryClientConfig(endpoint)
            .setEndpoints([url])
            .setReadTimeout(readTimeout)
            .setWriteTimeout(writeTimeout);
        this.repository = new RDFRepositoryClient(this.config)
        let repo = this.repository as any
        repo.registerParser(new graphdb.parser.SparqlJsonResultParser({}));
    }

    select_payload(select: string): GetQueryPayload {
        return new graphdb.query.GetQueryPayload()
            .setQueryType(QueryType.SELECT)
            .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON)
            .setQuery(select)
    }

    /**
     * Exactutes the select query and returnes the wraped results
     * @param select query
     */
    async select_query(select: string): Promise<SelectResults> {
        let stream = await this.repository.query(this.select_payload(select))
        let results: Array<StringMap> = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (bindings) => {
                // the bindings stream converted to data objects with the registered parser
                let iterable:Iterable<[string, string]> = Object.entries(bindings)
                    .map((v: any,i)=>[v[0] as string, (v[1] as Term).value]) as unknown as Iterable<[string, string]>
                results.push(OrderedMap<string, string>(iterable))
            })
            ;
            stream.on('end', () => {
                // handle end of the stream
                resolve(new SelectResults(results));
            });
        })
    }

    /**
     * Returnes the expression genes in a set of samples
     * @param runs array of samples (NCBI runs)
     * @param genes list of genes to looks expression values for
     */
    async expressions(runs: Array<string>, ensemble_ids: Array<string>) {
        const queryString = Query.expressions(runs, ensemble_ids)
        const bindings = await this.select_query(queryString)
        const results = bindings.map(b=> Expressions.fromBinding(b))
        //console.log("expressions results", results)
        return results
    }


    /**
     * Gets list of all species from GraphDB
     */
    async species(): Promise<Array<Species>> {
        let results = await this.select_query(Query.species)
        return results.map(binding => Species.fromBinding(binding))
    }

    /**
     * Gets the list of all avaliable samples from GraphDB
     */
    async samples() {
        let results = await this.select_query(Query.samples)
        return results.map(binding => Sample.fromBinding(binding))
    }

    async genes(genes: Array<string>) {
        const queryString = Query.genes(genes)
        let results = await this.select_query(queryString)
        return results.map(binding => Gene.fromBinding(binding))
    }

    async referenceGenes(organism: string) {
        const queryString = Query.referenceGenes(organism)
        let results = await this.select_query(queryString)
        return results.map(binding => Gene.fromBinding(binding))
    }

    /**
     * Gets the ranked results of the research
     * @param limit number of top genes
     */
    async ranked_results(limit = 6): Promise<SelectResults> {
        const selectResults: SelectResults = await this.select_query(Query.results_ranked_genes(limit))
        //selectResults.map(binding => binding.toJSON() as GeneResults)
        return selectResults
    }

    /**
     * Returnes the list of Orhotologous genes for the genes spcified
     * @param genes ensembl ids of the genes
     * @param species
     * @param orthology_types
     */
    async orthology(genes: Array<string>, species: Array<string>, orthology_types: Array<string>): Promise<Array<Orthology>> {
        const queryString: string = Query.orthology(genes, species, orthology_types)
        const bindings = await this.select_query(queryString)
        const result = bindings.map(b=>Orthology.fromBinding(b))
        return result
    }

}