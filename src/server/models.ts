import {string} from "prop-types";
import {OrderedMap} from "immutable";



export const RDF_PREFIX = 'http://rdf.ebi.ac.uk/resource/ensembl/';
export const SRA_PREFIX = 'https://www.ncbi.nlm.nih.gov/sra/';
export const BIOPROJECT_PREFIX = 'https://www.ncbi.nlm.nih.gov/bioproject/';
export const LAB_RESOURCE_PREFIX = 'http://aging-research.group/resource/';
export const ORTHOLOGY_TYPES = [
    'ens:ortholog_one2one',
    'ens:ortholog_one2many',
    'ens:ortholog_many2many'
];

export type StringMap = OrderedMap<string, string>

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


// WILL BE MOVED TO graph_old.js
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

/*
         ?bioproject rdf:type samples:Bioproject . #gets all bioprojects
            ?bioproject samples:has_series ?series .
            ?series samples:has_run ?run . #gets sequencing runs from experimental series
            ?run samples:has_organism ?organism . #species
            ?run samples:used_in_project :Cross-species . #defines the project
            ?run samples:of_tissue ?tissue . #gets tissue
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
            ?run samples:has_protocol ?protocol .
 */

export class Sample{
    constructor(public organism: string,
                public sex: string,
                public run: string,
                public source: string,
                public sequencer: string,
                public bioproject: string,
                public tissue: string,
                public sample_name: string,
                public study_title: string
    ) {
    }

    static fromBinding(bindings: StringMap){
        return new Sample(
            bindings.get<string>("organism", "").replace(LAB_RESOURCE_PREFIX, ''),
            bindings.get<string>("sex", "").replace(/"/g, ''),
            bindings.get<string>("run", "").replace(SRA_PREFIX,""),
            bindings.get<string>("source", "").replace(/"/g, ''),
            bindings.get<string>("sequencer", "").replace(LAB_RESOURCE_PREFIX, ""),
            bindings.get<string>("bioproject", "").replace(BIOPROJECT_PREFIX, ""),
            bindings.get<string>("tissue", "").replace(LAB_RESOURCE_PREFIX, ""),
            bindings.get<string>("sample_name", "").replace(LAB_RESOURCE_PREFIX, ""),
            bindings.get<string>("study_title", "").replace(LAB_RESOURCE_PREFIX, ""),
        )
    }
}

export class Orthology{

    constructor(public selected_gene: string,
                public selected_species: string,
                public orthology: string,
                public ortholog: string,
                public target_species: string,
                public common_name: string,
                public ortholog_gene: string
    ) {
    }

    static fromBinding(bindings: StringMap){
       return  new Orthology(
            bindings.get<string>("selected_gene", "").replace(RDF_PREFIX, ''),
            bindings.get<string>("selected_species", "").replace(LAB_RESOURCE_PREFIX, ''),
            bindings.get<string>("orthology", "").replace(RDF_PREFIX,""),
            bindings.get<string>("ortholog", "").replace(RDF_PREFIX, ''),
            bindings.get<string>("target_species", "").replace(LAB_RESOURCE_PREFIX, ""),
            bindings.get<string>("common_name", "").replace(/"/g, ""),
            bindings.get<string>("ortholog_gene", "").replace(/"/g, ""))
    }
}
/*
  "selected_gene": selected_gene.id.replace(RDF_PREFIX, ''),
                    "selected_species": selected_species.id.replace(LAB_RESOURCE_PREFIX, ''),
                    "orthology": orthology.id.replace(RDF_PREFIX, ''),
                    "ortholog":  ortholog === undefined ? "" : ortholog.id.replace(RDF_PREFIX, ''),
                    "target_species": target_species.id.replace(LAB_RESOURCE_PREFIX, ''),
                    "common_name": common_name.id.replace(/"/g, ''),
                    "ortholog_gene": ortholog_gene === undefined ? "": ortholog_gene.id.replace(/"/g, '')
 */
export class Expressions{
    constructor(public run: string, gene: string, tpm: number) {

    }
    static fromBinding(bindings: StringMap){
        return new Expressions(
            bindings.get<string>("run", "").replace('https://www.ncbi.nlm.nih.gov/sra/', ''),
            bindings.get<string>("gene", "").split('_')[1],
            parseFloat(bindings.get<string>("tpm", "NaN"))
        )
    }
}
/*
  run: bindings.run.id.replace('https://www.ncbi.nlm.nih.gov/sra/', ''),
                    gene: bindings.expression.id.split('_')[1],
                    tpm: this.getNumberFromRDF(bindings.tpm.id)
 */

export class Gene{
    constructor(public symbol: string, public ensembl_id: string) {
    }

    static fromBinding(bindings: StringMap){
        return new Gene(
            bindings.get<string>("gene", "").replace(RDF_PREFIX, ''),
            bindings.get<string>("symbol", "").replace(LAB_RESOURCE_PREFIX, ''),
        )
    }
}

/**
 * symbol: bindings.symbol.id.replace(/"/g, ''),
 ensembl_id: bindings.gene.id
 */
