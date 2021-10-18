import {Type} from "class-transformer";
import {List, OrderedMap} from "immutable";
import {string} from "prop-types";
import {Expressions, Gene, Orthology} from "./models";
import {expressions, genes, referenceGenes} from "../server/queries";

enum ExpressionAggregate {
    Sum,
    Min,
    Max,
    Avg,
}

export class ExpressionsTable{

    expressionsByGenes: OrderedMap<string, List<Expressions>>
    expByGeneRun: OrderedMap<string, OrderedMap<string, List<Expressions>>> //expressions by genes and run

    constructor(public orthologyData: OrthologyData, public runs: Array<string>, public expressions: Array<Expressions>) {
        this.expressionsByGenes = List.of(...expressions)
            .groupBy(v=>v.gene)
            .map(byGene=>byGene.toList()).toOrderedMap()

        this.expByGeneRun = this.expressionsByGenes
                .map(geneVals=>
                    geneVals.groupBy(v=>v.run).map((v=>v.toList()))
                        .toOrderedMap() //type trick, typing in immutable.js sucks!
                )
    }
    static empty(){
        return new ExpressionsTable(OrthologyData.empty, new Array<string>(), new Array<Expressions>())
    }

    /**
     * Decides what to do if there are several orthologues
     * @param runs
     * @param aggregate
     */
    aggregateRuns(runs: List<Expressions>,aggregate: ExpressionAggregate = ExpressionAggregate.Sum): Number
    {
            if(aggregate === ExpressionAggregate.Min) {
                return runs.minBy(r=>r.tpm)?.tpm!
            }
            else if(aggregate == ExpressionAggregate.Max){
                return runs.maxBy(r=>r.tpm)?.tpm!
            } else{
                const sum = runs.reduce<number>((agg, el, key, iter) =>
                        agg + el.tpm
                    , 0.0
                )
                if(aggregate == ExpressionAggregate.Avg) {
                    return sum / runs.size
                } else {
                    return sum
                }
            }
    }

    makeRows(aggregate: ExpressionAggregate = ExpressionAggregate.Sum): Array<any>{
        console.log("expression by runs", this.expByGeneRun.toJSON())
        return this.orthologyData.all_genes.map(gene => {
            console.log("gene expressions of ", gene.ensembl_id, "are", this.expByGeneRun.get(gene.ensembl_id))
            const expByRuns = this.expByGeneRun.get(gene.ensembl_id)
            if (expByRuns === undefined) {
                console.error("NOT FOUND", gene.ensembl_id, "in ", this.expByGeneRun.toJSON())
                return new Array<any>()
            } else {
                this.runs.map(run => {
                        const runs = expByRuns.get(run, List<Expressions>())
                        if (runs.size === 0) {
                            return {[run]: "N/A"}
                        } else {
                            return {[run]: this.aggregateRuns(runs)}
                        }
                    }
                )
            }
        }).toArray()
    }

}

/**
 * Main class to manage orthologies and make tables of them
 */
export class OrthologyData{

    static empty: OrthologyData = new OrthologyData([], [], [], [])

    @Type(() => OrderedMap)
    orthology_table: OrderedMap<string, OrderedMap<string, List<Orthology>>>
    all_genes: List<Gene>
    bySpecies: OrderedMap<string, List<Gene>>


    constructor(
        public reference_genes: Array<Gene> = [],
        public species: Array<string> = [],
        public orthology_types: Array<string> = [],
        public orthologies: Array<Orthology> = []
    )
    {
        const orthoList = List.of(...orthologies)  //for the sake of groupBy
        const byId =  orthoList.groupBy<string>( item => item.selected_gene)
        this.orthology_table =  byId
            .map((values, key: string) =>
                values.toList() // trick to override weird typing in immutable js type annotations
                    .groupBy<string>(v=>v.target_species)
                    .toOrderedMap()// trick to override weird typing in immutable js type annotations
                    .map((v, k) => v.toList())
            ).toOrderedMap()
        this.all_genes = List(reference_genes).concat(...orthoList.map(o=>o.gene))
        this.bySpecies = this.all_genes
            .groupBy(g=>g.species)
            .map((values, key)=>values.toList()
            )
            .toOrderedMap()

    }

    get isEmpty(){
        return this.reference_genes.length == 0 || this.species.length ==0
    }

    /**
     *
     * @param selectedOrganism selected organism
     * @param mapper map gene to
     * @param reducer reduce several genes to
     */
    makeRows(selectedOrganism: string,
             mapper: (gene: Gene) => string = (gene: Gene) => gene.ensembl_id,
             reducer: (acc: string, ortholog: string) => string = (acc: string, ortholog: string): string => acc + ";" + ortholog
    ){
        return this.reference_genes.map(gene =>{
                if(!this.orthology_table.has(gene.ensembl_short)){
                    console.error("cannot find key", gene.ensembl_id, "in orthology table which is",
                        this.orthology_table.toJSON()
                    )
                    console.error("length is")
                }
                const item = this.orthology_table.get(gene.ensembl_short)!
                const speciesList = this.species.includes(selectedOrganism) ? List(this.species) :  List(this.species).unshift(selectedOrganism)
                const rows = speciesList.map(sp=> {
                    if(sp == selectedOrganism) return [sp, gene.text];
                    else
                    if(item.has(sp))
                    {
                        const ortho: Array<Orthology> = item.get(sp)!.toArray(); //getting ortholog genes for the species
                        const reduced = ortho.map(v=>mapper(v.gene)).reduce((acc, ortholog)=> reducer(acc, ortholog))
                        return [sp, reduced]
                    }
                    else
                        return [sp, "N/A"]
                })
                return OrderedMap(rows).toJSON()
            }
        )
    }

    makeRowsText(selectedOrganism: string){
        return this.makeRows(selectedOrganism, gene => gene.text, (acc, ortholog)=> acc + ";" + ortholog)
    }
}