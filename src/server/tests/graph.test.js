const graph = require('../graph.js');
const repo = new graph.GraphRepository("http://10.40.3.21:7200/repositories/ensembl")

test('RDF graph should return orthology_table', async () => {
    const requestString = `{"reference_genes":["ENSG00000164362","ENSG00000084676"],"species":["Homo_sapiens","Gopherus_agassizii","Gorilla_gorilla"],"orthologyTypes":["ens:ortholog_one2one","ens:ortholog_one2many"]}`
    const request = JSON.parse(requestString)
    console.log("request:", request)
    const {   reference_genes, species, orthologyTypes} = request;
    const results = await repo.orthology_table(reference_genes, species, orthologyTypes)
    console.log("RESULTS:", JSON.stringify(results,null, 2))
    console.log("TODO: make proper test for orthology_table")
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