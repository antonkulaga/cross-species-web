allZValues =  GENE_EXPRESSIONS.map(function(row){ 
    return row.map(function(x){
        //TODO: parseInt?
        // if(!x) return 0;
        return Math.log(x+1);//TODO: divide / Math.log(10); 
    });
});


  $(document).ready(function(){
    //   console.log(ALL_X_VALUES, ALL_Y_VALUES, allZValues)
    $('#show_results').click(function(){
        let xValues = [];
        let xIndices = [];
        
        let yValues = [];
        let yIndices = [];

        let zValues = [];

        console.log("show results");
        selectedRows = gridOptions.api.getSelectedRows();

        const layout = {
            // title: 'Heatmap with selected genes and samples',
            annotations: [],
            margin: {
                l: 100,
                r: 100,
                t: 250,
                b: 50
            },
            autosize: true,
            xaxis: {
                side: 'top',
                tickfont: {
                    size: 12
                },
                tickangle: '-30'
            },
            yaxis: {
                side: 'left',
                autorange: 'reversed',
                tickfont: {
                    size: 12
                }
            },
        };

        function isSelectedGene(gene) {
            for(var i = 0; i < selectedGenes.length; i++){
                if(selectedGenes[i].ensembl_id == gene)
                    return true;
            }
            return false;
        }

        function isSelectedSample(sample_id) {
            for(var i = 0; i < selectedRows.length; i++){
                if(selectedRows[i].run == sample_id)
                    return true;
            }
            return false;
        }

        for ( var i = 0; i < ALL_X_VALUES.length; i++ ) {
            if(!isSelectedSample(ALL_X_VALUES[i]))
                    continue;
            
            // xValues.push(ALL_X_VALUES[i]);
            xIndices.push(i);
        }

        for ( var i = 0; i < ALL_Y_VALUES.length; i++ ) {
            if(!isSelectedGene(ALL_Y_VALUES[i]))
                continue;
            
            // yValues.push(ALL_Y_VALUES[i]);
            yIndices.push(i);
        }


        function getHeatmapColumnName(value){
            var curr = value;
            var words = curr.split(" ");
            for (var y = 0; y < words.length - 1; y++) {
                words[y] += " ";
            }
            // console.log(words);
            if(words.length >1){
                curr = words[0][0] + " ";
            } else if(words.length == 1){
                curr = words[0];
            }
            for(x = 1; x < words.length; x++){
                curr = curr + words[x];
            }
            return curr;
        }

        // for ( var i = 0; i < yValues.length; i++ ) {
        //     for ( var j = 0; j < xValues.length; j++ ) {
        //         const currentValue = allZValues[yIndices[i]][xIndices[j]];//TODO: parseInt?
        //         if (currentValue != 0.0) {
        //             var textColor = 'white';
        //         }else{
        //             var textColor = 'black';
        //         }
        //         const result = {
        //             xref: 'x1',
        //             yref: 'y1',
        //             x: xValues[j],
        //             y: yValues[i],
        //             text: GENE_EXPRESSIONS[yIndices[i]][xIndices[j]],
        //             font: {
        //                 family: 'Arial',
        //                 size: 5,
        //                 color: 'rgb(50, 171, 96)'
        //             },
        //             showarrow: false,
        //             font: {
        //                 color: textColor,
        //                 size: '12'
        //             }
        //         };
        //         zValues.push(currentValue);
        //         console.log(i, j,yValues[i], xValues[j], currentValue,GENE_EXPRESSIONS[yIndices[i]][xIndices[j]])
        //         layout.annotations.push(result);
        //     }
        // }

        var speciesHash = {};

        for ( var i = 0; i < ALL_X_VALUES.length; i++ ) {
            for(var j = 0; j < SAMPLES_VALUES.length; j++){
                if(ALL_X_VALUES[i] == SAMPLES_VALUES[j].run){
                                    // console.log(ALL_X_VALUES[i], SAMPLES_VALUES[j])                    
                    speciesHash[ALL_X_VALUES[i]] = getHeatmapColumnName(SAMPLES_VALUES[j].organism + " "+ SAMPLES_VALUES[j].source);

                }

            }
            if(speciesHash[ALL_X_VALUES[i]] == null){
                speciesHash[ALL_X_VALUES[i]] = ALL_X_VALUES[i];
            }
        }
        // console.log("speciesHash", speciesHash);

        //sort ALL_X_VALUES by maximum lifespan descending
        var maximumLifesSpanBySpecies = {};
        for(var i = 0; i < selectedRows.length; i++){
            maximumLifesSpanBySpecies[selectedRows[i].run] = selectedRows[i].maximum_longevity;
        }
        for(var i = 0; i < ALL_X_VALUES.length -1 ; i++){
            for(var j = i + 1 ; j < ALL_X_VALUES.length; j++){
                if(maximumLifesSpanBySpecies[ALL_X_VALUES[i]] == null){
                    maximumLifesSpanBySpecies[ALL_X_VALUES[i]] = 0;
                }

                if(maximumLifesSpanBySpecies[ALL_X_VALUES[j]] == null){
                    maximumLifesSpanBySpecies[ALL_X_VALUES[j]] = 0;
                }

                if(maximumLifesSpanBySpecies[ALL_X_VALUES[j]] > maximumLifesSpanBySpecies[ALL_X_VALUES[i]]){
                    var aux = ALL_X_VALUES[j];
                    ALL_X_VALUES[j] = ALL_X_VALUES[i];
                    ALL_X_VALUES[i] = aux;
                }
            }
        }

        console.log(ALL_Y_VALUES.length,ALL_X_VALUES.length);
        var alreadyUsedSample = {}

        for ( var i = 0; i < ALL_Y_VALUES.length; i++ ) {
            if(!isSelectedGene(ALL_Y_VALUES[i]))
                continue;
          
            for ( var j = 0; j < ALL_X_VALUES.length; j++ ) {
                if(!isSelectedSample(ALL_X_VALUES[j]))
                    continue;

                if(alreadyUsedSample[ALL_X_VALUES[j]] != null){
                        continue;
                } else {
                    alreadyUsedSample[ALL_X_VALUES[j]] = 1;
                }

                // console.log(i, j)
                const currentValue = allZValues[i][j];//TODO: parseInt?
                if (currentValue != 0.0) {
                    var textColor = 'white';
                }else{
                    var textColor = 'black';
                }
                const result = {
                    xref: 'x1',
                    yref: 'y1',
                    x: speciesHash[ALL_X_VALUES[j]] + ", " + ALL_X_VALUES[j],
                    // x: ALL_X_VALUES[j],

                    y: ENSEMBL_TO_NAME[ALL_Y_VALUES[i]],
                    text: parseFloat(GENE_EXPRESSIONS[i][j]).toFixed(2),
                    font: {
                        family: 'Arial',
                        size: 5,
                        color: 'rgb(50, 171, 96)'
                    },
                    showarrow: false,
                    font: {
                        color: textColor,
                        size: '12'
                    }
                };
                xValues.push(speciesHash[ALL_X_VALUES[j]] + ", " + ALL_X_VALUES[j]);
                yValues.push(ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]);
                zValues.push(allZValues[i][j]);
                layout.annotations.push(result);
            }
            alreadyUsedSample = {};
        }

        layout.width = Math.max(500, 75 * xIndices.length);
        layout.height = Math.max(500, 40 * yIndices.length);

        
        const data = [{
            x: xValues,
            y: yValues,
            z: zValues,

            colorscale: 'RdBu',
            type: 'heatmap'
        }];

        console.log(xValues.length, yValues.length, zValues.length);
        // console.log(data,layout,xValues,yValues,zValues)
        // console.log(xIndices, yIndices)
        Plotly.newPlot('genes_heatmap', data, layout);
        const heatmapElement = document.getElementById("genes_heatmap");
        heatmapElement.scrollIntoView();
        heatmapElement.style = "overflow:scroll;";
    });
  });