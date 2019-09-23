allZValues =  GENE_EXPRESSIONS.map(function(row){ 
    return row.map(function(x){
        //TODO: parseInt?
        // if(!x) return 0;
        return Math.log(x+1);//TODO: divide / Math.log(10); 
    });
});


  $(document).ready(function(){
      console.log(allXValues, allYValues, allZValues)
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
                t: 150,
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

        for ( var i = 0; i < allXValues.length; i++ ) {
            if(!isSelectedSample(allXValues[i]))
                    continue;
            
            // xValues.push(allXValues[i]);
            xIndices.push(i);
        }

        for ( var i = 0; i < allYValues.length; i++ ) {
            if(!isSelectedGene(allYValues[i]))
                continue;
            
            // yValues.push(allYValues[i]);
            yIndices.push(i);
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

        for ( var i = 0; i < allYValues.length; i++ ) {
            if(!isSelectedGene(allYValues[i]))
                continue;
            for ( var j = 0; j < allXValues.length; j++ ) {
                if(isSelectedSample(allXValues[j]))
                    console.log(i,j)
                if(!isSelectedSample(allXValues[j]))
                    continue;

                console.log(i, j)
                const currentValue = allZValues[i][j];//TODO: parseInt?
                if (currentValue != 0.0) {
                    var textColor = 'white';
                }else{
                    var textColor = 'black';
                }
                const result = {
                    xref: 'x1',
                    yref: 'y1',
                    x: allXValues[j],
                    y: allYValues[i],
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
                xValues.push(allXValues[j]);
                yValues.push(allYValues[i]);
                zValues.push(allZValues[i][j]);
                layout.annotations.push(result);
            }
        }

        layout.width = Math.max(500, 75 * xIndices.length);
        layout.height = Math.max(500, 40 * yIndices.length);

        
        const data = [{
            x: xValues,
            y: yValues,
            z: zValues,

            colorscale: 'RdBu',
            type: 'heatmap' , reversescale: true
        }];

        // console.log(xValues.length, yValues.length, zValues.length);
        console.log(data,layout,xValues,yValues,zValues)
        console.log(xIndices, yIndices)
        Plotly.newPlot('genes_heatmap', data, layout);
        const heatmapElement = document.getElementById("genes_heatmap");
        heatmapElement.scrollIntoView();
        heatmapElement.style = "overflow:scroll;";
    });
  });