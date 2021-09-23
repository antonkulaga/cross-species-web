import * as graphdb from "graphdb"
import "immutable"
//import {Promise} from "bluebird";
import {fromJS, OrderedMap, Seq, List} from "immutable";
import * as Query from "./queries"
import {SelectResults, Species, StringMap, Sample, Orthology, Expressions, Gene} from "./models"
import {Term, Literal, NamedNode, BlankNode} from "n3";
const {RDFMimeType} = graphdb.http;
const log = console.log
const {RepositoryClientConfig, RDFRepositoryClient} = graphdb.repository

export class GraphRepository {

    config: RepositoryClientConfig
    repository: RDFRepositoryClient

    constructor(endpoint: string = "http://graphdb.agingkills.eu", repository: string = "ensembl", readTimeout: number = 30000, writeTimeout: number = 30000) {
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

    async expressions(runs, genes) {
        const queryString = Query.expressions(runs, genes)
        const results = await this.select_query(queryString)
        return results.map(b=> Expressions.fromBinding(b))
    }


    async species(): Promise<Array<Species>> {
        let results = await this.select_query(Query.species)
        return results.map(binding => Species.fromBinding(binding))
    }

    async samples() {
        let results = await this.select_query(Query.samples)
        return results.map(binding => Sample.fromBinding(binding))
    }

    async referenceGenes(referenceOrg) {
        const queryString = Query.referenceGenes(referenceOrg)
        let results = await this.select_query(queryString)
        return results.map(binding => Gene.fromBinding(binding))
    }

    async ranked_results(limit = 6): Promise<unknown> {
        return await this.select_query(Query.results_ranked_genes(limit))
    }

    async orthology(genes: Array<string>, species: Array<string>, orthologyTypes): Promise<List<Orthology>> {
        const queryString: string = Query.orthology(genes, species, orthologyTypes)
        const result = await this.select_query(queryString)
        return List.of(...result.map(b=>Orthology.fromBinding(b)))
    }

    async orthology_table(genes: Array<string>, species: Array<string>, orthologyTypes){
        const results = await this.orthology(genes,species,orthologyTypes)
        const grouped = results.groupBy( item => item.selected_gene).map((values, key) => values.groupBy(v=>v.target_species))
        return ({
            genes: genes,
            species: species,
            orthology_types: orthologyTypes,
            orthology_table: grouped// dictionary.toJS()
        })
        //TODO: figure out
    }

}