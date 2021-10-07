export const results_ranked_genes: (limit: number) => string = (limit = 0) => {
    return `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?gene ?symbol ?rank ?relative_frequency ?max_linear_r2 where { 
            GRAPH <http://aging-research.group/resource/paper_1_results> {?gene <http://aging-research.group/resource/has_analysis_rank> ?rank} .        
            ?gene <http://aging-research.group/resource/mean_abs_shap> ?mean_abs_shap .
            ?gene <http://aging-research.group/resource/mean_kendall_tau> ?mean_kendall_tau .
            ?gene <http://aging-research.group/resource/MLS_influence> ?MLS_influence .
            ?gene <http://aging-research.group/resource/relative_frequency> ?relative_frequency .
            ?gene <http://aging-research.group/resource/max_linear_r2> ?max_linear_r2 .
            ?gene rdfs:label ?symbol .
        } ORDER BY ?rank ${limit === 0 ? "" : "LIMIT "+ limit}    
        `
}

export const samples: string = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
    PREFIX samples:<http://aging-research.group/samples/>
    PREFIX ncbi: <https://www.ncbi.nlm.nih.gov/>
    PREFIX : <http://aging-research.group/resource/>
    
    SELECT * WHERE
    {
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
    } ORDER BY ?organism ?bioproject ?series ?run
`

export const species: string = `
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

export const orthology: (genes: Array<string>, species: Array<string>, orthologyTypes: Array<string>) => string =
    (genes, species, orthologyTypes)=>
    {
    return `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
      PREFIX : <http://aging-research.group/resource/>
      
      SELECT ?selected_gene ?selected_species ?orthology ?ortholog ?target_species ?common_name ?ortholog_gene   WHERE { 
          values ?target_species { :${species.join(' :')} }    #put species selected by the user (info from selected samples)
          values ?selected_gene { ens:${genes.join(' ens:')} }
          ?selected_species :has_gene ?selected_gene .   
    
          values ?orthology { ${orthologyTypes.join(' ')} }
          ?selected_gene ?orthology ?ortholog .   
    
          OPTIONAL { ?ortholog rdfs:label ?ortholog_gene . }
    
          ?target_species :has_gene ?ortholog .
          ?target_species :has_common_name ?common_name .
      } ORDER BY ?selected_gene ?ortholog ?species`
}

export const  expressions = (runs: Array<string>, genes: Array<string>) => {
    return `PREFIX samples:<http://aging-research.group/samples/>
    PREFIX sra: <https://www.ncbi.nlm.nih.gov/sra/>

    SELECT * WHERE
    {
      values ?run { sra:${runs.join(' sra:')} }
      values ?expression { samples:has_${genes.join('_expression samples:has_')}_expression } .
      ?run ?expression ?tpm .
    }`;
}

export const referenceGenes = (referenceOrg: string) => {
    return `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ens: <http://rdf.ebi.ac.uk/resource/ensembl/>
      PREFIX : <http://aging-research.group/resource/>
      
      SELECT ?species ?gene ?symbol WHERE { 
          values ?species { :${referenceOrg} } . #put your species of interest instead of Homo_sapiens   
          ?gene rdfs:label ?symbol .
          ?species :has_gene ?gene .
      }
    `
}