allZValues =  GENE_EXPRESSIONS.map(function(row){ 
    return row.map(function(x){
        //TODO: parseInt?
        return Math.log(x);//TODO: divide / Math.log(10); 
    });
});


  $(document).ready(function(){
      console.log(allXValues, allYValues, allZValues)
    $('#show_results').click(function(){
        let xValues = [];
        let yValues = [];
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
                    text: GENE_EXPRESSIONS[i][j],
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

        layout.width = 1000 * xValues.length / 18;
        layout.height = 1000 * yValues.length / 22;

        
        const data = [{
            x: xValues,
            y: yValues,
            z: zValues,

            colorscale: 'RdBu',
            type: 'heatmap' , reversescale: true
        }];

        console.log(data,layout)
        Plotly.newPlot('genes_heatmap', data, layout);
        const heatmapElement = document.getElementById("genes_heatmap");
        heatmapElement.scrollIntoView();
        heatmapElement.style = "overflow:scroll;";
    });
  });