import {string} from "prop-types";
import {Collection, fromJS, List, OrderedMap} from "immutable";
import {Type} from "class-transformer";
import "reflect-metadata";
import {species} from "../server/queries";


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


export class RequestContent implements RequestInit{
    body: string
    constructor(public content,
                public method: string = "post",
                public headers: HeadersInit = {Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
    ) {
        this.body = JSON.stringify(content)
    }
}

export class TextOption{
    constructor(public key: string, public value: string, public text: string) {
    }

    static fromSpecies(species: Species)  {
        return new TextOption(species.common_name, species.species, species.common_name)
    }
}

/**
 {
    "key": "genes_pro",
    "value": "genes_pro",
    "text": "Pro Longevity Genes",
    "genes": JSON.parse(genes_pro)
}
 */

export class GeneSet extends TextOption{

    @Type(() => Gene)
    genes: Array<Gene>
    key: string

    constructor(set_name: string,
                text: string,
                genes: Array<Gene>) {
        super(text, set_name, text);
        this.key = set_name
        this.genes = genes
    }
}
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

    static fromSample(row: Sample) {
            return new Species(
                row.organism,
                row.common_name!,
                row.ensembl_url!,
                row.taxon!,
                row.animal_class!,
                row.lifespan!,
                row.mass_g!,
                row.metabolic_rate!,
                row.temperature_kelvin!
            )
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

    get mass_kg(): number  {
        return this.mass / 1000.0
    }
    get temperature_celsius(): number {
        return this.temperature_kelvin - 273 //273.15
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

/**
 * class that represents metadata for the sequencing sample.
 * It is assume by default that it is GEO or similar type of sequencing run
 * It also contains some optional fields copy-pasted form species as it is also used as SamplesGrid row
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
                public study_title: string,
                public lifespan: undefined | number = undefined,
                public common_name: undefined | string = undefined,
                public mass_g: undefined | number = undefined,
                public ensembl_url: undefined | string = undefined,
                public metabolic_rate: undefined | number = undefined,
                public temperature_kelvin: undefined | number = undefined,
                public animal_class: undefined | string = undefined,
                public taxon: undefined | string = undefined
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

export class GeneResults {
    constructor(
    public gene: string,
    public symbol: string,
    public rank: number,
    public max_linear_r2: number,
    public relative_frequency: number
    ) {
    }

    get asGene() {
        return new Gene(this.gene, this.symbol)
    }

    static fromBinding(bindings: OrderedMap<string, any>){
        return new GeneResults(
            bindings.get("gene").replace(RDF_PREFIX, '')!,
            bindings.get("symbol")!,
            bindings.get("rank")!,
            bindings.get("max_linear_r2")!,
            bindings.get("relative_frequency")!
        )
    }
}

export class Gene{

   constructor(public ensembl_id: string, public symbol: string) {}

    get ensembl_short(){
        return this.ensembl_id.replace('http://rdf.ebi.ac.uk/resource/ensembl/', "")
    }
    get text(){
        return this.symbol + " (" + this.ensembl_short + ")"
    }

    static fromBinding(bindings: StringMap){
        return new Gene(
            bindings.get<string>("gene", "").replace(RDF_PREFIX, ''),
            bindings.get<string>("symbol", "").replace(LAB_RESOURCE_PREFIX, ''),
        )
    }
}

export class OrthologyData{

    static empty: OrthologyData = new OrthologyData([], [], [], OrderedMap())

    static fromOrthologyData(genes: Array<string>, species: Array<string>, orthologyTypes: Array<string>, results: Array<Orthology>) {
        const grouped =  List.of(...results) //for the sake of groupBy
            .groupBy<string>( item => item.selected_gene)
            .map((values, key: string) =>
                values.toList()
                    .groupBy<string>(v=>v.target_species)
                    .toOrderedMap()
                    .map((v, k) => v.toList())
            ).toOrderedMap()
        return new OrthologyData(genes, species, orthologyTypes, grouped )//TODO: figure out types
    }

    @Type(() => OrderedMap)
    orthology_table: OrderedMap<string, OrderedMap<string, List<Orthology>>>

    constructor(
        //public genes: Array<Gene> = [],
        //public species: Array<Species> = [],
        public reference_genes: Array<string> = [],
        public species: Array<string> = [],
        public orthology_types: Array<string> = [],
        orthology_table: OrderedMap<string, OrderedMap<string, List<Orthology>>>
    )
    {
        this.orthology_table = orthology_table
    }

    get isEmpty(){
        return this.reference_genes.length == 0 || this.species.length ==0
    }

    /**
     * Make rows for the orthology table
     * @param selectedOrganism
     */
    makeRows(selectedOrganism: string){
        return this.reference_genes.map(gene =>{
                const item = this.orthology_table.get(gene)!
                const speciesList = this.species.includes(selectedOrganism) ? List(this.species) :  List(this.species).unshift(selectedOrganism)
                const rows = speciesList.map(sp=> {
                    if(sp == selectedOrganism) return [sp, gene];
                    else
                    if(item.has(sp))
                    {
                        const ortho: Array<Orthology> = item.get(sp)!.toArray(); //getting ortholog genes for the species
                        return [sp, ortho.map(v=>v.ortholog).reduce((acc, ortholog)=> acc +"," + ortholog + ";")]
                    }
                    else
                        return [sp, "N/A"]
                })
                return OrderedMap(rows).toJSON()
                }
        )
    }
}