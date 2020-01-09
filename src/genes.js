const genesDropdown = $('#gene_lists');
selectedGenes = GENAGE_GENES_PRO;
genesDropdown.dropdown({
    onChange: function(val) {
        switch(val){
            case "Pro-Longevity Genes":
                selectedGenes = GENAGE_GENES_PRO;
                break;
            case "Anti-Longevity Genes":
                selectedGenes = GENAGE_GENES_ANTI;

                break;
        }
        console.log(selectedGenes);
        
    }
});

