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

        for ( var i = 0; i < allXValues.length; i++ ) {
            if(!isSelectedSample(allXValues[i]))
                    continue;
            
            xValues.push({val: allXValues[i], idx: i});
        }

        for ( var i = 0; i < allYValues.length; i++ ) {
            if(!isSelectedGene(allYValues[i]))
                continue;
            
            yValues.push({val: allYValues[i], idx: i});
        }


        for ( var i = 0; i < yValues.length; i++ ) {
            for ( var j = 0; j < xValues.length; j++ ) {
                const currentValue = allZValues[yValues[i].idx][xValues[j].idx];//TODO: parseInt?
                if (currentValue != 0.0) {
                    var textColor = 'white';
                }else{
                    var textColor = 'black';
                }
                const result = {
                    xref: 'x1',
                    yref: 'y1',
                    x: xValues[j].val,
                    y: yValues[i].val,
                    text: GENE_EXPRESSIONS[yValues[i].idx][xValues[j].idx],
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
                zValues.push(allZValues[yValues[i].idx][xValues[j].idx]);
                console.log(i, j,yValues[i], xValues[j], allZValues[yValues[i].idx][xValues[j].idx],GENE_EXPRESSIONS[yValues[i].idx][xValues[j].idx])
                layout.annotations.push(result);
            }
        }

        layout.width = Math.max(500, 1000 * xValues.length / 18);
        layout.height = Math.max(500, 1000 * yValues.length / 22);

        
        const data = [{
            x: xValues,
            y: yValues,
            z: zValues,

            colorscale: 'RdBu',
            type: 'heatmap' , reversescale: true
        }];

        console.log(xValues.length, yValues.length, zValues.length);
        console.log(data,layout)
        Plotly.newPlot('genes_heatmap', data, layout);
        const heatmapElement = document.getElementById("genes_heatmap");
        heatmapElement.scrollIntoView();
        heatmapElement.style = "overflow:scroll;";
    });
  });