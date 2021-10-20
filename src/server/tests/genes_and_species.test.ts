import * as graphdb from "graphdb"
import {GraphRepository} from "../graph";
import * as jest from "jest"
//import "@types/jest"
import {Gene, Species} from "../../shared/models";
const host = "http://graphdb.agingkills.eu" //http://10.40.3.21:7200

const repo = new GraphRepository(host)

test("should return species", async () =>{

  const species = await repo.species()
    expect(species.map(s=>s.species)).toEqual(expect.arrayContaining([
        "Homo_sapiens", "Mus_musculus"
    ]))
    console.log("SPECIES ARE:", species)
})

test("should return reference genes for selected species", async () =>{

   const result = await repo.referenceGenes("Homo_sapiens")
    expect(result).toEqual(expect.arrayContaining([
        new Gene('ENSG00000124942',  'AHNAK', "Homo_sapiens"),
        new Gene ('ENSG00000136488',  'CSH1', "Homo_sapiens")
    ]))
})

test("should return gene descriptions for selected genes", async () =>{

    const result = await repo.genes(['ENSG00000124942', 'ENSG00000136488'])
    expect(result).toEqual(expect.arrayContaining([
        new Gene('ENSG00000124942',  'AHNAK', "Homo_sapiens"),
        new Gene ('ENSG00000136488',  'CSH1', "Homo_sapiens")
    ]))
})