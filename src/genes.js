const genesDropdown = $('#genes');
selectedGenes = genage_genes_pro;
genesDropdown.dropdown({
    onChange: function(val) {
        switch(val){
            case "Pro-Longevity Genes":
                selectedGenes = genage_genes_pro;
                break;
            case "Anti-Longevity Genes":
                selectedGenes = genage_genes_anti;

                break;
        }
        console.log(selectedGenes);
        
    }
});

