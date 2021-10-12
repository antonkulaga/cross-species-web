import * as graphdb from "graphdb"
import {GraphRepository} from "../graph";
import * as jest from "jest"
//import "@types/jest"
import {Gene, Species} from "../../shared/models";
import {List, OrderedMap} from "immutable";
const host = "http://graphdb.agingkills.eu" //http://10.40.3.21:7200
const log = console.log

const repo = new GraphRepository(host)

test('RDF graph should return orthology_table', async () => {
    const requestString = `{"reference_genes":["ENSG00000164362","ENSG00000084676"],"species":["Homo_sapiens","Gopherus_agassizii","Gorilla_gorilla"],"orthologyTypes":["ens:ortholog_one2one","ens:ortholog_one2many"]}`
    const request = JSON.parse(requestString)
    console.log("request:", request)
    const {   reference_genes, species, orthologyTypes} = request;
    const results = await repo.orthology_table(reference_genes, species, orthologyTypes)
    expect(new Set(results.reference_genes)).toEqual(new Set([
        "ENSG00000164362",
        "ENSG00000084676"
    ]));
    expect(new Set(results.species)).toEqual(new Set(
        [
            "Homo_sapiens",
            "Gopherus_agassizii",
            "Gorilla_gorilla"
        ]
    ))
    expect(results.reference_genes).toEqual(expect.arrayContaining([
       'ENSG00000164362', 'ENSG00000084676']
    ))
    expect(results.species).toEqual(expect.arrayContaining([
            "Homo_sapiens",
            "Gopherus_agassizii",
            "Gorilla_gorilla"
        ]
    ))
    console.log("ORTHOLOGY TABLE:", JSON.stringify(results.orthology_table,null, 2))

    /**
     *     RESULTS: {
      "genes": [
        "ENSG00000164362",
        "ENSG00000084676"
      ],
      "species": [
        "Homo_sapiens",
        "Gopherus_agassizii",
        "Gorilla_gorilla"
      ],
      "orthology_types": [
        "ens:ortholog_one2one",
        "ens:ortholog_one2many"
      ],
      "orthology_table": [
        {
          "selected_gene": "ENSG00000164362",
          "orthologs": {
            "Gopherus_agassizii": [
              {
                "ortholog_gene": "TERT",
                "common_name": "Desert tortoise",
                "orthology": "ortholog_one2one",
                "ortholog": "ENSGAGG00000022112",
                "target_species": "Gopherus_agassizii"
              }
            ],
            "Gorilla_gorilla": [
              {
                "ortholog_gene": "TERT",
                "common_name": "Gorilla",
                "orthology": "ortholog_one2one",
                "ortholog": "ENSGGOG00000002607",
                "target_species": "Gorilla_gorilla"
              }
            ]
          }
        },
        {
          "selected_gene": "ENSG00000084676",
          "orthologs": {
            "Gopherus_agassizii": [
              {
                "ortholog_gene": "NCOA1",
                "common_name": "Desert tortoise",
                "orthology": "ortholog_one2one",
                "ortholog": "ENSGAGG00000023954",
                "target_species": "Gopherus_agassizii"
              }
            ],
            "Gorilla_gorilla": [
              {
                "ortholog_gene": "NCOA1",
                "common_name": "Gorilla",
                "orthology": "ortholog_one2one",
                "ortholog": "ENSGGOG00000011279",
                "target_species": "Gorilla_gorilla"
              }
            ]
          }
        }
      ]
    }

     */


    return results

});

test("orthology table should convert to orthology rows", async () => {
    const requestString = `{"reference_genes":["ENSG00000164362","ENSG00000084676"],"species":["Homo_sapiens","Gopherus_agassizii","Gorilla_gorilla"],"orthologyTypes":["ens:ortholog_one2one","ens:ortholog_one2many"]}`
    const request = JSON.parse(requestString)
    console.log("request:", request)
    const {   reference_genes, species, orthologyTypes} = request;
    const results = await repo.orthology_table(reference_genes, species, orthologyTypes)
    const rows = results.makeRows("Homo_sapiens")
    console.log("ORTHOLOGY ROWS:", JSON.stringify(rows,null, 2))
    //{"reference_genes":["ENSG00000188747","ENSG00000170835","ENSG00000136436","ENSG00000198663","ENSG00000006282","ENSG00000142002"],"species":["Gopherus_agassizii","Gorilla_gorilla","Gorilla_gorilla","Macaca_mulatta"],"orthology_types":["ens:ortholog_one2one","ens:ortholog_one2many"],"orthology_table":{}}
})