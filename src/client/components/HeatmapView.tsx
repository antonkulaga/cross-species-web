import {Divider, Header, Segment} from "semantic-ui-react";
import {Annotations, ColorScale, Layout, PlotData} from "plotly.js";

import Plotly from "react-plotly.js";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {ExpressionRow, ExpressionsTable, OrthologyData} from "../../shared/tables";
import {Sample} from "../../shared/models";
import {OrderedMap} from "immutable";

type HeatmapViewInput = {
    children?: JSX.Element | JSX.Element[],
    expressionsTable: ExpressionsTable
    expressionRows: Array<ExpressionRow>
    //selectedSamples: Array<Sample>,
    //orthologyData: OrthologyData
    //setShowLoader: Dispatch<SetStateAction<boolean>>,
    //autoSizeAll: (value: any) => void
}

export const HeatmapView = ({expressionsTable}: HeatmapViewInput) => {

    const [heatmapData, setHeatmapData] = useState<Partial<PlotData>[]>([])


    /**
     * TODO: type this!
     */
    const default_layout: Partial<Layout> = {
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
            tickangle: -30
            //autosize: true
        },
        yaxis: {
            side: 'left',
            autorange: 'reversed',
            tickfont: {
                size: 12
            }
            //autosize: true
        }
    };


    const [layout, setLayout] = useState<Partial<Layout>>(default_layout)



    useEffect(() => {

        if(expressionsTable.expressions.length > 0){
            console.info("should render heatmap!")
            const xValues = expressionsTable.runs
            const yValues = expressionsTable.orthologyData.reference_genes
            const zValues = expressionsTable.matrix
            //updateHeatmap(xValues, yValues.map(g=>g.ensembl_id), zValues, expressionsTable.expressionsByGeneByRun)
            //const zValues =
        }

    }, [expressionsTable])

    return (
        <Segment>
            <Divider horizontal>
                <Header as='h4'>
                    View as heatmap
                </Header>
            </Divider>
            <Plotly
                data={
                       heatmapData
                }
                layout={layout}
                style={{
                    display: 'flex',
                    overflow: 'scroll',
                    flex:1,
                    justifyContent:'center',
                    alignItems:'center'
                }} />
        </Segment>
    )


    const updateHeatmap = (xValues: Array<string>, yValues: Array<string>, zValues: Array<any>, expressionsByGeneByRun: OrderedMap<string, string>) => {
        layout.width = Math.max(1000, 75 * xValues.length);
        layout.height = Math.max(1000, 40 * yValues.length);
        const annos: Array<any> = yValues.flatMap(y=>
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
        layout.annotations = annos

        const colorScale: ColorScale = new Array<[number, string]>(
            [0.0, 'rgb(0,0,0)'],
            [0.05, 'rgb(69,117,180)'],
            [0.2222, 'rgb(116,173,209)'],
            [0.3333, 'rgb(171,217,233)'],
            [0.4444, 'rgb(224,243,248)'],
            [0.5555, 'rgb(254,224,144)'],
            [0.6666, 'rgb(253,174,97)'],
            [0.7777, 'rgb(244,109,67)'],
            [0.95, 'rgb(215,48,39)'],
            [1.0, 'rgb(255,0,0)']
        )
        const dvalues: Partial<PlotData> = {
            x: xValues,
            y: yValues,
            z: zValues,
            //colorscale: 'RdBu',
            colorscale: colorScale,
           // hoverongaps: false,
            showscale: false,
            type: 'heatmap'
        }
        console.log("DATA values", dvalues)

        console.log("===================")
        console.log("layout", layout)
        setLayout(layout)
        setHeatmapData([dvalues])
        setTimeout(() =>{
            //TODO unbreak
            //if(heatmapRef.current !== null) heatmapRef.current.el.scrollIntoView()
            }, 5000
        );
    }
}

export default  HeatmapView


class HeatMapData implements Partial<PlotData>{
    constructor() {
    }

    /*
    "line.color": Color;
    "line.dash": Dash;
    "line.shape": "linear" | "spline" | "hv" | "vh" | "hvh" | "vhv";
    "line.simplify": boolean;
    "line.smoothing": number;
    "line.width": number;
    "marker.color": Color;
    "marker.colorbar": {};
    "marker.colorscale": ColorScale | ColorScale[];
    "marker.line": Partial<ScatterMarkerLine>;
    "marker.line.color": Color;
    "marker.line.colorscale": ColorScale | ColorScale[];
    "marker.maxdisplayed": number;
    "marker.opacity": number | number[];
    "marker.pad.b": number;
    "marker.pad.l": number;
    "marker.pad.r": number;
    "marker.pad.t": number;
    "marker.showscale": boolean;
    "marker.size": number | number[] | number[][];
    "marker.sizemax": number;
    "marker.sizemin": number;
    "marker.sizemode": "diameter" | "area";
    "marker.sizeref": number;
    "marker.symbol": MarkerSymbol | MarkerSymbol[];
    autobinx: boolean;
    automargin: boolean;
    boxmean: boolean | "sd";
    boxpoints: "all" | "outliers" | "suspectedoutliers" | false;
    branchvalues: "total" | "remainder";
    cliponaxis: boolean;
    colorbar: Partial<ColorBar>;
    colorscale: ColorScale;
    connectgaps: boolean;
    customdata: Datum[] | Datum[][];
    delta: Partial<Delta>;
    direction: "clockwise" | "counterclockwise";
    domain: Partial<{ row: number; column: number; x: number[]; y: number[] }>;
    error_x: ErrorBar;
    error_y: ErrorBar;
    fill: "none" | "tozeroy" | "tozerox" | "tonexty" | "tonextx" | "toself" | "tonext";
    fillcolor: string;
    gauge: Partial<Gauge>;
    groupnorm: "" | "fraction" | "percent";
    histfunc: "count" | "sum" | "avg" | "min" | "max";
    hole: number;
    hoverinfo: "all" | "name" | "none" | "skip" | "text" | "x" | "x+text" | "x+name" | "x+y" | "x+y+text" | "x+y+name" | "x+y+z" | "x+y+z+text" | "x+y+z+name" | "y" | "y+name" | "y+x" | "y+text" | "y+x+text" | "y+x+name" | "y+z" | "y+z+text" | "y+z+name" | "y+x+z" | "y+x+z+text" | "y+x+z+name" | "z" | "z+x" | "z+x+text" | "z+x+name" | "z+y+x" | "z+y+x+text" | "z+y+x+name" | "z+x+y" | "z+x+y+text" | "z+x+y+name";
    hoverlabel: Partial<HoverLabel>;
    hoveron: "points" | "fills";
    hovertemplate: string | string[];
    hovertext: string | string[];
    i: TypedArray;
    ids: string[];
    j: TypedArray;
    jitter: number;
    k: TypedArray;
    labels: Datum[];
    lat: Datum[];
    legendgroup: string;
    level: string;
    line: Partial<ScatterLine>;
    locationmode: "ISO-3" | "USA-states" | "country names" | "geojson-id";
    locations: Datum[];
    lon: Datum[];
    marker: Partial<PlotMarker> | Partial<BoxPlotMarker>;
    mode: "lines" | "markers" | "text" | "lines+markers" | "text+markers" | "text+lines" | "text+lines+markers" | "none" | "gauge" | "number" | "delta" | "number+delta" | "gauge+number" | "gauge+number+delta" | "gauge+delta";
    name: string;
    number: Partial<PlotNumber>;
    opacity: number;
    orientation: "v" | "h";
    parents: string[];
    pointpos: number;
    r: Datum[];
    reversescale: boolean;
    rotation: number;
    selectedpoints: Datum[];
    showlegend: boolean;
    showscale: boolean;
    stackgaps: "infer zero" | "interpolate";
    stackgroup: string;
    text: string | string[];
    textfont: Partial<Font>;
    textinfo: "label" | "label+text" | "label+value" | "label+percent" | "label+text+value" | "label+text+percent" | "label+value+percent" | "text" | "text+value" | "text+percent" | "text+value+percent" | "value" | "value+percent" | "percent" | "none";
    textposition: "top left" | "top center" | "top right" | "middle left" | "middle center" | "middle right" | "bottom left" | "bottom center" | "bottom right" | "inside" | "outside" | "auto" | "none";
    theta: Datum[];
    title: Partial<DataTitle>;
    transforms: DataTransform[];
    transpose: boolean;
    type: PlotType;
    value: number;
    values: Datum[];
    visible: boolean | "legendonly";
    width: number | number[];
    x: Datum[] | Datum[][] | TypedArray;
    xaxis: string;
    xbins: { start: number | string; end: number | string; size: number | string };
    xgap: number;
    xy: Float32Array;
    y: Datum[] | Datum[][] | TypedArray;
    yaxis: string;
    ygap: number;
    z: Datum[] | Datum[][] | Datum[][][] | TypedArray;
    zmax: number;
    zmin: number;
    zsmooth: "fast" | "best" | false;
     */

}

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