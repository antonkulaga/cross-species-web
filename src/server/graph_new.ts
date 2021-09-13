import * as graphdb from "graphdb"
//import "graphdb/lib/types"
const {RDFMimeType} = graphdb.http;
const query = graphdb.query
const log = console.log
const {RepositoryClientConfig, RDFRepositoryClient} = graphdb.repository

class GraphRepository {


    config: RepositoryClientConfig
    repository: RDFRepositoryClient

    constructor(endpoint: string = 'http://agingkills.eu:7200', repository: string = "ensembl", readTimeout: number = 30000, writeTimeout: number = 30000) {
        const url = `${endpoint}/repositories/${repository}`
        this.config = new RepositoryClientConfig(endpoint)
            .setEndpoints([url])
            .setReadTimeout(readTimeout)
            .setWriteTimeout(writeTimeout);
        this.repository = new RDFRepositoryClient(this.config)
        //this.repository.registerParser(new graphdb.parser.SparqlJsonResultParser());
    }

    select_payload(select: string){
        return new query.GetQueryPayload()
            .setQuery(select)
            .setQueryType(query.QueryType.SELECT)
            .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);
    }

    async select_query(select: string): Promise<any>  {
        return await g.repository.query(this.select_payload(select))
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

    async species() {
        this.select_query(this.query_string_species).then(result=>{
            log("SPECIES RESULT",result)

            }
        )
            /*
        return this.repository.query(payload)
            .then(stream => new Promise((resolve, reject) => {
                const speciesNames = [];
                stream.on('data', (bindings) => {
                    // the bindings stream converted to data objects with the registered parser
                    //console.log('@@', bindings);
                    speciesNames.push({
                        id: bindings.species.id.replace(LAB_RESOURCE_PREFIX,''),
                        common_name: bindings.common_name.id.replace(/"/g, ''),
                        mass_g:bindings.mass_g? this.getNumberFromRDF(bindings.mass_g.id) : '',
                        ensembl_url: bindings.ensembl_url.id,
                        lifespan: this.getNumberFromRDF(bindings.lifespan.id),
                        metabolic_rate: bindings.metabolic_rate ? this.getNumberFromRDF(bindings.metabolic_rate.id) : '',
                        temperature_kelvin: bindings.temperature_kelvin ? this.getNumberFromRDF(bindings.temperature_kelvin.id) : '',
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
             */
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

const g = new GraphRepository("http://pic:7200")
g.species()
//const str = g.results_ranked_genes_query_string(30)
//g.select_query(str).then(result => log("RESULT IS",result))
