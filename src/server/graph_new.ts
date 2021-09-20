import * as graphdb from "graphdb"
import "immutable"
import {Promise} from "bluebird";
import {OrderedMap, Seq} from "immutable";
import Indexed = Seq.Indexed;
import * as Immutable from "immutable";
import { match, select, instanceOf, __ } from 'ts-pattern';
import {string} from "prop-types";
import {Term, Literal, NamedNode, BlankNode} from "n3";
const {RDFMimeType} = graphdb.http;
const log = console.log
const {RepositoryClientConfig, RDFRepositoryClient} = graphdb.repository

// WILL BE MOVED TO graph.js


export const RDF_PREFIX = 'http://rdf.ebi.ac.uk/resource/ensembl/';
export const SRA_PREFIX = 'https://www.ncbi.nlm.nih.gov/sra/';
export const BIOPROJECT_PREFIX = 'https://www.ncbi.nlm.nih.gov/bioproject/';
export const LAB_RESOURCE_PREFIX = 'http://aging-research.group/resource/';
export const ORTHOLOGY_TYPES = [
    'ens:ortholog_one2one',
    'ens:ortholog_one2many',
    'ens:ortholog_many2many'
];

type StringMap = OrderedMap<string, string>


export class SelectResults{
    keys: Array<string>
    constructor(public bindings: Array<StringMap>) {
        this.keys = (bindings.length == 0) ? [] : [...bindings[0].keys()]
    }


    map<T>(fun: (binding: StringMap) => T): Array<T>{
        return this.bindings.map((value,_)=> fun(value))
    }

    toJSON(){
        return this.map(v=>v.toJSON())
    }
}
/*
"mass_g": "104.0", "ensembl_url": "https://www.ensembl.org/Monodelphis_domestica",
"species": "http://aging-research.group/resource/Monodelphis_domestica",
"lifespan": "5.1", "metabolic_rate": "0.335", "temperature_kelvin": "305.75",
"animal_class": "http://rdf.ebi.ac.uk/resource/ensembl/Mammalia",
"taxon": "http://rdf.ebi.ac.uk/resource/ensembl/taxon#13616", "common_name": "Gray short-tailed opossum"
*/
export class Species{
    constructor(public species: string,
                public common_name: string,
                public ensembl_url: string,
                public taxon: string,
                public animal_class: string,
                public lifespan: number,
                public mass: number,
                public metabolic_rate: number,
                public temperature_kelvin: number
    ) {
    }
    static fromBinding(bindings: StringMap) {
        return new Species(
            bindings.get<string>("species", "").replace(LAB_RESOURCE_PREFIX, ''),
            bindings.get<string>("common_name", "").replace(/"/g, ''),
            bindings.get<string>("ensembl_url", ""),
            bindings.get<string>("taxon", ""),
            bindings.get<string>("animal_class", ""),
            bindings.has("lifespan") ? parseFloat(bindings.get<string>("lifespan", "0.0")) : NaN,
            bindings.has("mass_g") ? parseFloat(bindings.get<string>("mass_g", "0.0")) : NaN,
            bindings.has("metabolic_rate") ? parseFloat(bindings.get<string>("metabolic_rate", "0.0")) : NaN,
            bindings.has("temperature_kelvin") ? parseFloat(bindings.get<string>("temperature_kelvin", "0.0")) : NaN,
        )
    }


}
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

    getNumberFromRDF(str: string) {
        return parseFloat(str.split('^^')[0].replace(/"/g, ''));
    }

    query_string_species: string = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
      PREFIX : <http://aging-research.group/resource/>

      SELECT * WHERE {     
            ?species :has_common_name ?common_name .
            ?species :has_ensembl_url ?ensembl_url .
            ?species :is_animal_class ?animal_class .
            ?species :has_lifespan ?lifespan .
            OPTIONAL { ?species :has_mass_g ?mass_g . }
            OPTIONAL { ?species :has_metabolic_rate ?metabolic_rate . }
            ?species :has_taxon ?taxon . 
            OPTIONAL { ?species :has_temperature_kelvin ?temperature_kelvin . }
            ?species rdf:type :Species .
      }
    `

    async species(): Promise<Array<Species>> {
        let results = await this.select_query(this.query_string_species)
        return results.map(binding => Species.fromBinding(binding))
    }

    query_string_results_ranked_genes(limit = 0) {
        return `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?gene ?label ?rank ?relative_frequency ?max_linear_r2 where { 
            GRAPH <http://aging-research.group/resource/paper_1_results> {?gene <http://aging-research.group/resource/has_analysis_rank> ?rank} .        
            ?gene <http://aging-research.group/resource/mean_abs_shap> ?mean_abs_shap .
            ?gene <http://aging-research.group/resource/mean_kendall_tau> ?mean_kendall_tau .
            ?gene <http://aging-research.group/resource/MLS_influence> ?MLS_influence .
            ?gene <http://aging-research.group/resource/relative_frequency> ?relative_frequency .
            ?gene <http://aging-research.group/resource/max_linear_r2> ?max_linear_r2 .
            ?gene rdfs:label ?label .
        } ORDER BY ?rank ${limit === 0 ? "" : "LIMIT "+ limit}    
        `
    }

    async ranked_results(limit = 6): Promise<unknown> {
        return await this.select_query(this.query_string_results_ranked_genes(limit))
    }

}

const host = "http://graphdb.agingkills.eu" //http://pic:7200
const g = new GraphRepository(host)
g.species().then(result => log("RESULT IS",result))
