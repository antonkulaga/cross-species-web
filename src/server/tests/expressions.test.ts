import * as graphdb from "graphdb"
import {GraphRepository} from "../graph";
import * as jest from "jest"
//import "@types/jest"
import {Gene, Orthology} from "../../shared/models";
import {OrthologyData} from "../../shared/tables";
import {string} from "prop-types";
const host = "http://graphdb.agingkills.eu" //http://10.40.3.21:7200

const repo = new GraphRepository(host)

test("expressions loading for selected species", async () => {
    //repo.get
    const requestString= `{"runs":["SRR306841","SRR787277","SRR6307196","SRR306808","SRR636900","SRR3195096","SRR223512","ERR1331676"],
    "genes":[{"ensembl_id":"ENSG00000188747","symbol":"NOXA1"},{"ensembl_id":"ENSG00000170835","symbol":"CEL"},{"ensembl_id":"ENSG00000136436","symbol":"CALCOCO2"},{"ensembl_id":"ENSG00000198663","symbol":"C6orf89"},{"ensembl_id":"ENSG00000006282","symbol":"SPATA20"},{"ensembl_id":"ENSG00000142002","symbol":"DPP9"},{"ensembl_id":"ENSECAG00000008281","symbol":"SPATA20","species":"Equus_caballus"},{"ensembl_id":"ENSGGOG00000003379","symbol":"SPATA20","species":"Gorilla_gorilla"},{"ensembl_id":"ENSHGLG00100006048","symbol":"SPATA20","species":"Heterocephalus_glaber"},{"ensembl_id":"ENSLAFG00000022872","symbol":"SPATA20","species":"Loxodonta_africana"},{"ensembl_id":"ENSMFAG00000044525","symbol":"SPATA20","species":"Macaca_fascicularis"},{"ensembl_id":"ENSTTRG00000000215","symbol":"SPATA20","species":"Tursiops_truncatus"},{"ensembl_id":"ENSECAG00000015498","symbol":"CALCOCO2","species":"Equus_caballus"},{"ensembl_id":"ENSGGOG00000005537","symbol":"CALCOCO2","species":"Gorilla_gorilla"},{"ensembl_id":"ENSHGLG00100012406","symbol":"CALCOCO2","species":"Heterocephalus_glaber"},{"ensembl_id":"ENSLAFG00000016693","symbol":"CALCOCO2","species":"Loxodonta_africana"},{"ensembl_id":"ENSMFAG00000000840","symbol":"CALCOCO2","species":"Macaca_fascicularis"},{"ensembl_id":"ENSTTRG00000008488","symbol":"CALCOCO2","species":"Tursiops_truncatus"},{"ensembl_id":"ENSECAG00000024983","symbol":"DPP9","species":"Equus_caballus"},{"ensembl_id":"ENSGGOG00000002848","symbol":"DPP9","species":"Gorilla_gorilla"},{"ensembl_id":"ENSHGLG00100017608","symbol":"DPP9","species":"Heterocephalus_glaber"},{"ensembl_id":"ENSLAFG00000009122","symbol":"DPP9","species":"Loxodonta_africana"},{"ensembl_id":"ENSMFAG00000040299","symbol":"DPP9","species":"Macaca_fascicularis"},{"ensembl_id":"ENSTTRG00000001733","symbol":"DPP9","species":"Tursiops_truncatus"},{"ensembl_id":"ENSECAG00000013218","symbol":"CEL","species":"Equus_caballus"},{"ensembl_id":"ENSGGOG00000015855","symbol":"","species":"Gorilla_gorilla"},{"ensembl_id":"ENSHGLG00100008388","symbol":"CEL","species":"Heterocephalus_glaber"},{"ensembl_id":"ENSLAFG00000003263","symbol":"CEL","species":"Loxodonta_africana"},{"ensembl_id":"ENSMFAG00000042247","symbol":"CEL","species":"Macaca_fascicularis"},{"ensembl_id":"ENSTTRG00000014433","symbol":"CEL","species":"Tursiops_truncatus"},{"ensembl_id":"ENSECAG00000018904","symbol":"NOXA1","species":"Equus_caballus"},{"ensembl_id":"ENSGGOG00000041617","symbol":"","species":"Gorilla_gorilla"},{"ensembl_id":"ENSMFAG00000030739","symbol":"NOXA1","species":"Macaca_fascicularis"},{"ensembl_id":"ENSTTRG00000003852","symbol":"NOXA1","species":"Tursiops_truncatus"},{"ensembl_id":"ENSECAG00000024122","symbol":"C20H6orf89","species":"Equus_caballus"},{"ensembl_id":"ENSGGOG00000013941","symbol":"C6orf89","species":"Gorilla_gorilla"},{"ensembl_id":"ENSHGLG00100013699","symbol":"C6orf89","species":"Heterocephalus_glaber"},{"ensembl_id":"ENSLAFG00000000208","symbol":"C6orf89","species":"Loxodonta_africana"},{"ensembl_id":"ENSMFAG00000042966","symbol":"C6orf89","species":"Macaca_fascicularis"},{"ensembl_id":"ENSTTRG00000002299","symbol":"C6orf89","species":"Tursiops_truncatus"}]}`
    const body = JSON.parse(requestString)
    const { runs, genes }: {runs: Array<string>, genes: Array<Gene | string>} = body;
    if(genes.length > 0){
        const ensembl_ids = (genes[0] instanceof string) ? genes as Array<string>:  genes.map(gene=> (gene as Gene).ensembl_id)
        console.log("loading gene expressions for ", ensembl_ids)
        const result = await repo.expressions(runs, ensembl_ids);
        console.log("EXPRESSIONS ARE: ", result)
    }
})