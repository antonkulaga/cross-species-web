import * as graphdb from "graphdb"
import "immutable"
import {Promise} from "bluebird";
import {OrderedMap, Seq} from "immutable";
import * as Query from "./queries"
import Indexed = Seq.Indexed;
import * as Immutable from "immutable";
import {SelectResults, Species, StringMap, Sample} from "./models"
import { match, select, instanceOf, __ } from 'ts-pattern';
import {string} from "prop-types";
import {Term, Literal, NamedNode, BlankNode} from "n3";
const {RDFMimeType} = graphdb.http;
const log = console.log
const {RepositoryClientConfig, RDFRepositoryClient} = graphdb.repository

export class GraphRepository {

    config: RepositoryClientConfig
    repository: RDFRepositoryClient

    constructor(endpoint: string = 'http://agingkills.eu:7200', repository: string = "ensembl", readTimeout: number = 30000, writeTimeout: number = 30000) {
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

    parseRDF(term: Term) {
        return term.value
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


    async species(): Promise<Array<Species>> {
        let results = await this.select_query(Query.species)
        return results.map(binding => Species.fromBinding(binding))
    }

    async ranked_results(limit = 6): Promise<unknown> {
        return await this.select_query(Query.results_ranked_genes(limit))
    }

    async samples() {
        let results = await this.select_query(Query.samples)
        return results.map(binding => Sample.fromBinding(binding))
    }
}

const host = "http://graphdb.agingkills.eu" //http://pic:7200
const g = new GraphRepository(host)
//g.species().then(result => log("RESULT IS",result))
g.samples().then(result => log("SAMPLES RESULT IS:",result))
