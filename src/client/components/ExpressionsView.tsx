import React, {useState, useEffect, useCallback, useReducer, useRef, Dispatch, SetStateAction} from 'react'
import {Button, Divider, Dropdown, Header, Icon, Image,  Segment, Step, Tab, Table} from 'semantic-ui-react'
import {AgGridReact} from "ag-grid-react";
import Plotly from "react-plotly.js";
import {List, Map, OrderedMap} from "immutable";
import {Expressions, Gene, Orthology, RequestContent, Sample, TextOption} from "../../shared/models";
import {Layout} from "plotly.js";
import {GridApi} from "ag-grid-community";
import {plainToClass} from "class-transformer";
import {ExpressionsTable, OrthologyData} from "../../shared/tables";

type ExpressioinsViewInput = {
    children?: JSX.Element | JSX.Element[],
    selectedSamples: Array<Sample>,
    orthologyData: OrthologyData
    setShowLoader: Dispatch<SetStateAction<boolean>>,
    autoSizeAll: (value: any) => void
}


//NOT YET READY
export const ExpressionsView = ({orthologyData, selectedSamples, setShowLoader, autoSizeAll}: ExpressioinsViewInput) => {

    //const round = (num) => isNaN(num) ? null: Math.round((num + Number.EPSILON) * 100) / 100

    const expressionsGridOptions = {
        suppressRowClickSelection: true,
        suppressAggFuncInHeader: true,
        rowDragManaged: true,
        debug: true,
        // floatingFilter: true
    };


    /**
     * TODO: type this!
     */
    const default_layout: any = {
        // title: 'ExpressionsView with selected genes and samples',
        annotations: [],
        margin: {
            l: 300,
            r: 100,
            t: 300,
            b: 50
        },
        legend : {
            orientation: "h" //'h' | 'v'
        },
        autosize: true,
        xaxis: {
            side: 'top',
            tickfont: {
                size: 12
            },
            tickangle: '-30',
            autosize: true
        },
        yaxis: {
            side: 'left',
            autorange: 'reversed',
            tickfont: {
                size: 12
            },
            autosize: true
        }
    };

    //const [runs, setRuns] = useState<Array<string>>([])
    const [expressionRows, setExpressionRows] = useState<Array<any>>([])

    const [layout, setLayout] = useState<Layout>(default_layout)

   // const heatmapRef = React.createRef();

    //const referenceByOrthologRef = useRef(Map())
    //const expressionsByGeneByRunRef = useRef(OrderedMap())


    const baseOrthologyColumnDefs = [
        {
            headerName: 'Samples/Genes',
            field: 'selected_gene'
        }
    ];

    const [expressionsColumnDefs, setExpressionsColumnDefs] = useState(baseOrthologyColumnDefs)
    //const [genesForSearch, setGenesForSearch] = useState<List<Gene>>(List()) //TODO: change name
    const [expressions, setExpressions] = useState<Array<Expressions>>([])
    const [expressionsTable, setExpressionsTable] = useState<ExpressionsTable>(ExpressionsTable.empty())

    const [expressionsGridApi, setExpressionsGridApi] = useState<GridApi>({} as any)
    const [data, setData] = useState<Array<any>>([])

    const renderHeatMap = () => canRender() ?  ( <Segment>
        <Divider horizontal>
            <Header as='h4'>
               View as heatmap
            </Header>
        </Divider>
        <Plotly
            data={data}
            layout={layout}
            style={{
                display: 'flex',
                overflow: 'scroll',
                flex:1,
                justifyContent:'center',
                alignItems:'center'
            }} />
    </Segment>)
         : false

    /**
     * Gets gene expressions
     * @param runs
     * @param genes
     */
    const fetchExpressions = async  (runs: Array<string>, genes: Array<Gene>): Promise<Array<Expressions>> => {
        const toSend = {
            runs, genes
        }
        const content = new RequestContent(toSend)
        let response = await fetch('/api/expressions', content);
        return await response.json().then(res=> plainToClass(Expressions, res))
    }

    const updateHeatmap = (xValues, yValues, zValues, expressionsByGeneByRun) => {
        layout.width = Math.max(1000, 75 * xValues.length);
        layout.height = Math.max(1000, 40 * yValues.length);
        layout.annotations = yValues.flatMap(y=>
            xValues.map(x=>
                ({
                    xref: 'x1',
                    yref: 'y1',
                    x: x,
                    y: y,
                    text:  expressionsByGeneByRun.get(y+","+x),
                    font: {
                        family: 'Arial',
                        size: 12,
                        color: 'rgb(50, 171, 96)'
                    },
                    showarrow: false,
                })
            ) // design debt = fix duplicate
        )

        const dvalues = {
            x: xValues,
            y: yValues,
            z: zValues,
            //colorscale: 'RdBu',
            colorscale: [
                ['0.0', 'rgb(0,0,0)'],
                ['0.05', 'rgb(69,117,180)'],
                ['0.222222222222', 'rgb(116,173,209)'],
                ['0.333333333333', 'rgb(171,217,233)'],
                ['0.444444444444', 'rgb(224,243,248)'],
                ['0.555555555556', 'rgb(254,224,144)'],
                ['0.666666666667', 'rgb(253,174,97)'],
                ['0.777777777778', 'rgb(244,109,67)'],
                ['0.95', 'rgb(215,48,39)'],
                ['1.0', 'rgb(255,0,0)']
            ],
            hoverongaps: false,
            showscale: false,
            type: 'heatmap'
        }
        console.log("DATA values", dvalues)

        console.log("===================")
        console.log("layout", layout)
        setLayout(layout)
        setData([dvalues])
        setTimeout(() =>{
            //TODO unbreak
            //if(heatmapRef.current !== null) heatmapRef.current.el.scrollIntoView()
            }, 5000
        );
    }

    const onExpressionsGridReady = (params) => {
        params.api.setDomLayout('autoHeight')
        autoSizeAll(params.columnApi);
        setExpressionsGridApi(params.api)
    }

    const canRender = (): boolean => orthologyData.reference_genes.length > 0 && selectedSamples.length > 0

    /**
     * Effects
     */

    /**
     * filling expression Columns and ExpressionsTable based on known values of
     */
    useEffect(() => {
        const runs = selectedSamples.map(s=>s.run)
        const cols = baseOrthologyColumnDefs.concat(
            runs.map(run => (
                {
                    headerName: run,
                    field: run,
                    minWidth: 50
                })))
        console.log("Expression columns are", cols)
        setExpressionsColumnDefs(cols)
        setExpressionsTable(new ExpressionsTable(orthologyData,runs, expressions))
    }, [selectedSamples, orthologyData, expressions])

    useEffect(() => {
        console.log("expression by genes", expressionsTable.expressionsByGenes.toJSON())
        const rows = expressionsTable.makeRows()
        console.log("expression rows are", rows)
            setExpressionRows(rows)
        }
    , [expressionsTable])


    const loadGeneExpressionsClick = async () => {
        const expressions = await fetchExpressions(selectedSamples.map(s=>s.run), orthologyData.reference_genes)
        console.log("loading gene expressions, which are:", expressions)
        setExpressions(expressions)
    }

    const downloadClick = () => {
        expressionsGridApi.exportDataAsCsv({fileName: "expressions.csv"});
    }

    return(
        <Segment>
            <Button onClick={loadGeneExpressionsClick}
                    className="ui blue"
                    size="massive" disabled={selectedSamples.length === 0}
            >
                Load gene expressions
            </Button>
            <div className="gridHolder" style={{ height: 'calc(100% - 25px)', width: `calc(100% - 25px)` }}>
                <div className="ag-theme-balham">
                    <AgGridReact
                        rowData={expressionRows}
                        columnDefs={expressionsColumnDefs}
                        gridOptions={expressionsGridOptions}
                        onGridReady={onExpressionsGridReady}
                    />
                </div>
                <Button icon
                        disabled={expressionRows.length === 0}
                        onClick={downloadClick}
                        className="ui blue"
                >
                    <Icon name='download' />
                    Download gene expressions as CSV
                </Button>
            </div>
            { renderHeatMap() }

        </Segment>
        )
}

export default ExpressionsView



/*
const onGenesSearch = async () => {
if(genesForSearch.size===0) return false
setShowLoader(true)
console.log("genes for search are: ", genesForSearch.toJSON())
//const selectedSamples =
const expressions = await fetchExpressions(runs, genesForSearch.map(g=>g.ensembl_id).toArray())
console.log("expressions are: ", expressions)

//setExpressionRows


const rows = orthologyData.reference_genes.map(y => {
        const result: Record<string,any> = {"selected_gene": y}
        console.error("TODO: unbreak rows for expressions!")
        //runs.forEach(run=>result[run] = expressionsByGeneByRun.get(y+","+run))
        return result             //TODO: fix this ugly workaround
    }
)
return rows

//const expressionsByGeneByRun = OrderedMap(expressions.map(exp => [referenceByOrthologRef.current.get(exp.gene)+","+exp.run, round(exp.tpm)]))
/*
expressionsByGeneByRunRef.current = OrderedMap(expressions.map(exp => [referenceByOrthologRef.current.get(exp.gene)+","+exp.run, round(exp.tpm)]))
console.log("expression by gene by run",   expressionsByGeneByRunRef.current .toJS())


console.log("====================== PREPARIGN DATA FOR HEATMAP UPDATE, expressions are: ", expressions)

const expressionsByGeneByRun = expressionsByGeneByRunRef.current
console.log("RUNS ARE:", runs)
const matrix = orthologyData.reference_genes.map(y=> runs.map(x=>  expressionsByGeneByRun.get(y+","+x)))
const rows = orthologyData.reference_genes.map(y => {
    const result: Record<string,any> = {"selected_gene": y}
    runs.forEach(run=>result[run] = expressionsByGeneByRun.get(y+","+run))
    return result             //TODO: fix this ugly workaround
    }
)
console.log("EXPRESSION ROWS: ", rows)
await setExpressionRows(rows)

await updateHeatmap(runs, orthologyData.reference_genes, matrix, expressionsByGeneByRun)
await setShowLoader(false)
}

useEffect( () => {
onGenesSearch().then((result)=>{
    console.log("Gene expressions results", result)
})
}, [genesForSearch])
*/

/*

  let GENE_EXPRESSIONS = [];
  let allZValues = [];
  let hashString = {};
  const COLOR_RANGE_STD_DEVIATIONS = 3;

  let ALL_X_VALUES = [];
  let ALL_Y_VALUES = [];


      GENE_EXPRESSIONS = await response.json();
      // allZValues = GENE_EXPRESSIONS;
      console.log("getGeneExpression",  JSON.stringify(GENE_EXPRESSIONS));

      let allYValues = [];
      let hashXValues = [];
      let allXValues = [];
      let hashEnsembleName = [];

      allYValues = Object.keys(genesMap);

      console.log("allYValuesAl", allYValues);

      for(let i = 0; i < GENE_EXPRESSIONS.length; i++){
          if(hashXValues[GENE_EXPRESSIONS[i].run] == null){
              allXValues.push(GENE_EXPRESSIONS[i].run);
              hashXValues[GENE_EXPRESSIONS[i].run] = true;
          }
      }

      let genesMappedBySpecies = genesMapBySpecies;
      console.log("speciesByRun", speciesByRun);
      console.log("genesMappedBySpecies", genesMappedBySpecies);
      for(let i = 0; i < allXValues.length; i++){
          let currentSample = allXValues[i];
          for(let j = 0; j < allYValues.length; j++) {
              let currentGene = allYValues[j];
              let speciesName = speciesByRun.get(currentSample)
              // console.log('dsgsdgs',speciesName, currentGene + speciesName);
              let genesFromOrthologyTable_raw = (genesMappedBySpecies[currentGene + speciesName]); //renamed to raw to avoid var reassignment
              if(genesFromOrthologyTable == null){
                  if( hashString[currentSample] == null){
                      hashString[currentSample] = [];
                  }
                  hashString[currentSample][currentGene] = "0.00";
                  continue;
              }
              let genesFromOrthologyTable = genesFromOrthologyTable_raw.split(',');
              // console.log('xxx', genesFromOrthologyTable);


              let found = false;
              for(let k = 0; k < genesFromOrthologyTable.length; k++){
                  for(let y = 0 ; y < GENE_EXPRESSIONS.length; y++){
                      if(GENE_EXPRESSIONS[y].run === currentSample &&
                          GENE_EXPRESSIONS[y].gene === genesFromOrthologyTable[k]){
                          // console.log("SSSSSS");
                          if(hashString[currentSample] == null){
                              hashString[currentSample] = [];
                              hashString[currentSample][currentGene] = [];
                              hashString[currentSample][currentGene] = GENE_EXPRESSIONS[y].tpm;
                          } else {
                              if( hashString[currentSample][currentGene] == null){
                                  hashString[currentSample][currentGene] = [];
                                  hashString[currentSample][currentGene] = GENE_EXPRESSIONS[y].tpm;
                              } else  {
                                  hashString[currentSample][currentGene] = JSON.stringify(parseFloat( hashString[currentSample][currentGene])
                                      + parseFloat(GENE_EXPRESSIONS[y].tpm));
                              }
                          }
                          found = true;
                          if(found){
                              allZValues.push(hashString[currentSample][currentGene]);
                          }
                      }
                  }
              }

              if(found === false){
                  if(hashString[currentSample] == null){
                      hashString[currentSample] = [];
                      hashString[currentSample][currentGene] = [];
                      hashString[currentSample][currentGene] = "0.00";
                  } else {
                      hashString[currentSample][currentGene] = [];
                      hashString[currentSample][currentGene] = "0.00";
                  }
                  allZValues.push("0.00");
              }
          }
      }
      console.log("hashString", hashString);

      console.log("allZValues", allZValues);
      ALL_X_VALUES = allXValues; ALL_Y_VALUES = allYValues;

      renderHeatmap();
      setShowLoader(false);
  }

  const getHeatmapColumnName = (value) => {
      let curr = value;
      const words = curr.split(' ');
      for (let y = 0; y < words.length - 1; y++) {
          words[y] += ' ';
      }
      // console.log(words);
      if (words.length > 1) {
          curr = `${words[0][0]} `;
      } else if (words.length === 1) {
          curr = words[0];
      }
      for (let x = 1; x < words.length; x++) {
          curr += words[x];
      }
      return curr;
  }



  const renderHeatmap = () => {
      const xValues = [];
      const xIndices = [];

      const yValues = [];
      const yIndices = [];

      const zValues = [];


      for (let i = 0; i < ALL_X_VALUES.length; i++) {
          // if (!this.isSelectedSample(ALL_X_VALUES[i])) { continue; }

          // xValues.push(ALL_X_VALUES[i]);
          xIndices.push(i);
      }

      for (let i = 0; i < ALL_Y_VALUES.length; i++) {
          // if (!this.isSelectedGene(ALL_Y_VALUES[i])) { continue; }

          // yValues.push(ALL_Y_VALUES[i]);
          yIndices.push(i);
      }

      const speciesHash = {};

      for (let i = 0; i < ALL_X_VALUES.length; i++) {
          for (let j = 0; j < SAMPLES_VALUES.length; j++) {
              if (ALL_X_VALUES[i] === SAMPLES_VALUES[j].run) {
                  // console.log(ALL_X_VALUES[i], SAMPLES_VALUES[j])
                  speciesHash[ALL_X_VALUES[i]] = getHeatmapColumnName(`${SAMPLES_VALUES[j].organism} ${SAMPLES_VALUES[j].source}`);
              }
          }
          if (speciesHash[ALL_X_VALUES[i]] == null) {
              speciesHash[ALL_X_VALUES[i]] = ALL_X_VALUES[i];
          }
      }
      console.log("speciesHash", speciesHash);
      console.log("allYValues", ALL_Y_VALUES);
      console.log(ALL_Y_VALUES.length, ALL_X_VALUES.length);
      let alreadyUsedSample = {};
      let alreadyUsedGene = {}
      let hash = {};
      for (let i = 0; i < ALL_Y_VALUES.length; i++) {
          hash[i] = [];
          // if (!this.isSelectedGene(ALL_Y_VALUES[i])) { continue; }
          // if(alreadyUsedGene[ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]] != null){
          //   continue;
          // } else {
          //   alreadyUsedGene[ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]] = 1;
          // }

          for (let j = 0; j < ALL_X_VALUES.length; j++) {
              // if (!this.isSelectedSample(ALL_X_VALUES[j])) { continue; }

              // if (alreadyUsedSample[ALL_X_VALUES[j]] != null) {
              //   continue;
              // } else {
              //   alreadyUsedSample[ALL_X_VALUES[j]] = 1;
              // }

              // // console.log(i, j)
              // if(hash[i][j] != null){
              //   continue;
              // } else {
              //   hash[i].push(1);
              // }


              //const currentValue = parseFloat(allZValues[i][j]);// TODO: parseInt?
              // if (currentValue != 0.0) {
              let textColor = 'white';
              // } else {
              //   var textColor = 'black';
              // }
              const result = {
                  xref: 'x1',
                  yref: 'y1',
                  x: `${speciesHash[ALL_X_VALUES[j]]}, ${ALL_X_VALUES[j]}`,
                  // x: ALL_X_VALUES[j],

                  y: ENSEMBL_TO_NAME[ALL_Y_VALUES[i]],
                  text: parseFloat(hashString[ALL_X_VALUES[j]][ALL_Y_VALUES[i]]).toFixed(2),

                  // font: {
                  //     family: 'Arial',
                  //     size: 5,
                  //     color: 'rgb(50, 171, 96)'
                  // },
                  showarrow: false,
                  font: {
                      color: textColor,
                      size: '12'
                  }
              };
              xValues.push(`${speciesHash[ALL_X_VALUES[j]]}, ${ALL_X_VALUES[j]}`);
              yValues.push(ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]);
              zValues.push(hashString[ALL_X_VALUES[j]][ALL_Y_VALUES[i]]);
              layout.annotations.push(result);
          }

          alreadyUsedSample = {};
      }

      layout.width = Math.max(500, 75 * xIndices.length);
      layout.height = Math.max(500, 40 * yIndices.length);

      // const colorsHash = {}
      let heatmapColors = zValues.map( x => parseFloat(x) )
      const std = math.std(heatmapColors)
      console.log("STD:", std)
      const mean = math.mean(heatmapColors)
      const zScores = {}
      let minColor = heatmapColors[0]
      let maxColor = heatmapColors[0]

      heatmapColors.forEach((color, idx) => {
          zScores[color] = (color - mean) / std
      })
      console.log("zScores:", zScores)

      const sortedColors = heatmapColors.sort((a,b) => a-b);
      console.log("sortedColors:", sortedColors)

      sortedColors.some((color,idx) => {
          // colorsHash[color] = color;
          if(zScores[color] < -COLOR_RANGE_STD_DEVIATIONS){
              minColor = sortedColors[idx + 1];
              console.log("color, minColor",color, minColor)
          }
          if(zScores[color] > COLOR_RANGE_STD_DEVIATIONS){
              maxColor = sortedColors[idx - 1];
              console.log("color, maxColor", color, maxColor)
              return true;
          }
      })

      setData([{
          x: xValues,
          y: yValues,
          z: zValues,

          // colorscale: 'RdBu',
          colorscale: [
              ['0.0', 'rgb(0,0,0)'],
              ['0.05', 'rgb(69,117,180)'],
              ['0.222222222222', 'rgb(116,173,209)'],
              ['0.333333333333', 'rgb(171,217,233)'],
              ['0.444444444444', 'rgb(224,243,248)'],
              ['0.555555555556', 'rgb(254,224,144)'],
              ['0.666666666667', 'rgb(253,174,97)'],
              ['0.777777777778', 'rgb(244,109,67)'],
              ['0.95', 'rgb(215,48,39)'],
              ['1.0', 'rgb(255,0,0)']
          ],
          // color: heatmapColors,
          showscale: false,
          type: 'heatmap',
          // colorbar: {
          //     tickvals: tickVals,
          //     ticks: 'outside'
          // }
      }])

      console.log(xValues.length, yValues.length, zValues.length);
      console.log(data,layout,xValues,yValues,zValues)
      console.log(xIndices, yIndices)
      // const heatmapElement = document.getElementById("heatmap");
      // console.log(this.heatmapRef.current.el);
      // scrollIntoViewIfNeeded(this.myheatmap.el, {
      //     scrollMode: 'if-needed',
      //     behavior: 'smooth'
      // });
      setTimeout(() => heatmapRef.current.el.scrollIntoView(), 3000);

  }

  const onClickExportHeatmap = async () => {
      alert("export heatmap");
  }


disabled={selectedRows.length === 0}
ref={heatmapRef}
  */