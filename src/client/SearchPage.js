/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/destructuring-assignment */
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import React, {useEffect, useState, } from 'react';
import {Button, Dropdown, Tab, Step, StepContent, Header, Icon, Image, Message, Divider} from 'semantic-ui-react';
import {List, fromJS, OrderedMap} from "immutable"


import './app.css';

import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';



import _ from 'lodash';
// import math from 'mathjs';
import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

import Plotly from 'react-plotly.js';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import Select from 'react-dropdown-select';

import Loader from 'react-loader-spinner';
import CsvDownload from 'react-json-to-csv';
import {SamplesGrid} from "./components/SamplesGrid";
import {SpeciesTable} from "./components/SpeciesTable";
import OrthologySelection from "./components/OrthologySelection";
import OrthologyTable from "./components/OrthologyTable";
import ExpressionsView from "./components/ExpressionsView";

// import SAMPLES_VALUES from './data/samples_values.json'


// import ALL_X_VALUES from './data/allXValues.json'
// import ALL_Y_VALUES from './data/allYValues.json'

// import GENE_EXPRESSIONS from './data/geneExpressions.json'


export const SearchPage = () => {


  let GENE_EXPRESSIONS = [];
  let allZValues = [];
  let hashString = {};
  const COLOR_RANGE_STD_DEVIATIONS = 3;

  let ALL_X_VALUES = [];
  let ALL_Y_VALUES = [];
  const layout = {
    // title: 'ExpressionsView with selected genes and samples',
    annotations: [],
    margin: {
      l: 100,
      r: 100,
      t: 250,
      b: 50
    },
    legend : {
      orientation: 'h' | 'v'
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
    }
  };

  const heatmapRef = React.createRef();

  const [species, setSpecies] = useState(OrderedMap())
  const [showLoader, setShowLoader] = useState(false)
  const [data, setData] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedGenes, setSelectedGenes] = useState([])
  const [genesMap, setGenesMap] = useState([])
  const [speciesByRun, setSpeciesByRun] = useState(OrderedMap())
  const [samplesRowData, setSamplesRowData] = useState([])
  const [organismList, setOrganismList] =useState([])
  const [genesBySymbol, setGenesBySymbol] = useState(OrderedMap())
  const [genesById, setGenesById] = useState(OrderedMap())




  const [genesMapBySpecies, setGenesMapBySpecies] = useState([])


  const [orthologyData, setOrthologyData] = useState([])

  const getSpecies =  () => fetch('/api/getSpecies').then(res => res.json())

  const getSamples = () => fetch('/api/getSamples').then(res => res.json())

  const getSamplesAndSpecies = async () => {
    console.log('getSamplesAndSpecies request'); // remove api
    const speciesArray = await getSpecies()
    const samplesArray = await getSamples()
    const speciesNames = speciesArray.map( species => ({ //rewrote ugly loops on arrays to more functional approach
          key: species.common_name,
          value: species.common_name,
          text: species.common_name,
          id: species.id
        })
    )
    const species = OrderedMap(speciesArray.map( sp => [sp.id , sp] ))
    const runToSpeciesHash = OrderedMap(samplesArray.filter(sample=>species.has(sample.organism)).map(sample => {
      const sp = species.get(sample.organism) //getting species from species Map
      sample.lifespan =  parseFloat(sp.lifespan);
      sample.common_name = sp.common_name;
      sample.mass_g = sp.mass_g;
      sample.ensembl_url = sp.ensembl_url;
      sample.metabolic_rate = sp.metabolic_rate;
      sample.temperature_celsius = parseFloat(sp.temperature_kelvin) - 273.15;
      sample.animal_class = sp.animal_class;
      sample.taxon = sp.taxon
      return [sample.run, sample]
    })).sortBy(value=>-value.lifespan)
    return ({
      species: species,
      speciesNames: speciesNames,
      runToSpeciesHash: runToSpeciesHash
    })
  }


  const getGeneExpression = async (runs, genes) => { //TODO: expression to

      console.log('getExpressions runs and genes', runs, genes);

      let response = await fetch('/api/getExpressions', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          runs,
          genes
        })
      });

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


  const autoSizeAll = (columnApi, skipHeader = false) => {
    const allColumnIds = [];
    columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId); //TODO: ask explanations for this line
    });
    columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  const onOrthologyGridReady = (params) => {
    autoSizeAll(params.columnApi);
  }

  const hasSelection = () => { return selectedRows.length === 0}


  useEffect(()=>{
    getSamplesAndSpecies().then( values => {
      const {species, speciesNames, runToSpeciesHash} = values
      setSpecies(species)
      setOrganismList(speciesNames)
      setSamplesRowData( Array.from(runToSpeciesHash.values()))
      setSpeciesByRun(runToSpeciesHash)
    })

    }, [])

  return (
    <div className="ui intro">
    <div className="ui main" style={{ margin: '30px'}} >
      <Message color="blue">
        <Message.Header>
          Welcome to the Cross-Species DB!
        </Message.Header>
        <Message.Content>
          <p> This database contains gene expression data from more than 7 organs of 47 species and allows you to compare expressions of orthologous genes.</p>
          <p> Please follow the steps to explore the database and make your own discoveries!</p>
        </Message.Content>
      </Message>
      <Step.Group size="large" fluid ordered vertical>
        <Step>
          <Image size="tiny" src="./public/RNA-Seq.png"> </Image>
          <Step.Content style={{ width: `calc(100% - 25px)` }}>
            <Step.Title><Header>Sample selection</Header></Step.Title>
            <Step.Description>

              <Message color='blue' size="small">Choose RNA-Seq samples of different species to compare with each other</Message>
            </Step.Description>
            <SamplesGrid samplesRowData={samplesRowData} setSelectedRows={setSelectedRows} autoSizeAll={autoSizeAll}>

            </SamplesGrid>
            <Divider horizontal>
              <Header as='h4'>
                Species in selected samples:
              </Header>
            </Divider>
            <SpeciesTable selectedRows={selectedRows}> </SpeciesTable>
          </Step.Content>
        </Step>
        <OrthologySelection
            organismList={organismList}
            selectedRows={selectedRows}
            setShowLoader={setShowLoader}
            hasSelection={hasSelection}
            genesBySymbol={genesBySymbol}
            setGenesBySymbol={setGenesBySymbol}
            genesById={genesById}
            setGenesById={setGenesById}
        >

        </OrthologySelection>
        <OrthologyTable
          selectedRows = {selectedRows}
          orthologyData={orthologyData} setOrthologyData = {setOrthologyData}
          setGenesMap = {setGenesMap}
          selectedGenes = {selectedGenes}
          setGenesMapBySpecies = {setGenesMapBySpecies}
          autoSizeAll={autoSizeAll} > </OrthologyTable>

        {data != null && <CsvDownload data={data} />}
        <ExpressionsView></ExpressionsView>
      </Step.Group>




      <Plotly
          ref={heatmapRef}
          data={data}
          layout={layout}
          style={{
            display: 'flex',
            overflow: 'scroll',
            flex:1,
            justifyContent:'center',
            alignItems:'center'
          }}
      />
      {/* ref={(el) => { this.heatmapRef = el; }} */}

    </div>
    {showLoader && <Loader
        type="ThreeDots"
        color="#00BFFF"
        height={200}
        width={200}
        timeout={1000000}
        style={ { position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)" }}

    />}

  </div>)

}

export default SearchPage