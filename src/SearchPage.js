import React from 'react'
import {Button, Dropdown} from 'semantic-ui-react'
import './App.css';

// import SamplesGrid from './SamplesGrid'
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import _ from 'lodash';


import Plotly from 'react-plotly.js';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import SAMPLES_VALUES from './data/samples_values.json'

import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

import ENSEMBL_TO_NAME from './data/ensemblToName.json'

import ALL_X_VALUES from './data/allXValues.json'
import ALL_Y_VALUES from './data/allYValues.json'

import GENE_EXPRESSIONS from './data/geneExpressions.json'

const SPECIES_TO_ENSEMBL = _.invertBy(ENSEMBL_TO_NAME)

// console.log("species to ensembl", JSON.stringify(SPECIES_TO_ENSEMBL));

const allZValues = GENE_EXPRESSIONS.map(function(row){ 
  return row.map(function(x){
      //TODO: parseInt?
      // if(!x) return 0;
      return Math.log(x+1);//TODO: divide / Math.log(10); 
  });
});

const columnDefs = [
  {
      headerName: 'Sample',
      field: 'run', 
      checkboxSelection: true, 
      headerCheckboxSelectionFilteredOnly: true,
      headerCheckboxSelection: true,
      filterParams: {
          filterOptions:['contains']
      }
      // width: 130
  },
  {
      headerName: "Species",
      field: "organism", 
      filterParams: {
          filterOptions:['contains']
      }
  },
  // {headerName: 'Species latin', field: 'organism',  rowGroupIndex: 0},
  {
      headerName: 'Max lifespan',
      field: 'maximum_longevity',
      filterParams: {
          filterOptions:['contains']
      }
  },
  {
      headerName: 'Tissue',
      field: 'source',
      filterParams: {
          filterOptions:['contains']
      }
  },
  {
      headerName: 'Sex',
      field: 'sex',
      filterParams: {
          filterOptions:['contains']
      }
  },
  {
      headerName: 'Sequencer', 
      field: 'sequencer'
  }
];

const GENES = [
  {"ensembl_id": "ENSG00000105974", key: "ENSG00000105974", value:  "CAV1", text: "CAV1"},
  {"ensembl_id": "ENSG00000197579", key: "ENSG00000197579", value:  "TOPORS", text: "TOPORS"},
  {"ensembl_id": "ENSG00000115414", key: "ENSG00000115414", value:  "FN1", text: "FN1"},
  {"ensembl_id": "ENSG00000164867", key: "ENSG00000164867", value:  "NOS3", text: "NOS3"},
  {"ensembl_id": "ENSG00000152127", key: "ENSG00000152127", value:  "MGAT5", text: "MGAT5"},
  {"ensembl_id": "ENSG00000138668", key: "ENSG00000138668", value:  "HNRNPD", text: "HNRNPD"},
  {"ensembl_id": "ENSG00000121680", key: "ENSG00000121680", value:  "PEX16", text: "PEX16"},
  {"ensembl_id": "ENSG00000104142", key: "ENSG00000104142", value:  "VPS18", text: "VPS18"},
  {"ensembl_id": "ENSG00000112562", key: "ENSG00000112562", value:  "SMOC2", text: "SMOC2"},
  {"ensembl_id": "ENSG00000198732", key: "ENSG00000198732", value:  "SMOC1", text: "SMOC1"},
  {"ensembl_id": "ENSG00000006715", key: "ENSG00000006715", value:  "VPS41", text: "VPS41"},
  {"ensembl_id": "ENSG00000068903", key: "ENSG00000068903", value:  "SIRT2", text: "SIRT2"},
  {"ensembl_id": "ENSG00000107105", key: "ENSG00000107105", value:  "ELAVL2", text: "ELAVL2"},
  {"ensembl_id": "ENSG00000163625", key: "ENSG00000163625", value:  "WDFY3", text: "WDFY3"},
  {"ensembl_id": "ENSG00000004776", key: "ENSG00000004776", value:  "HSPB6", text: "HSPB6"},
  {"ensembl_id": "ENSG00000126603", key: "ENSG00000126603", value:  "GLIS2", text: "GLIS2"},
  {"ensembl_id": "ENSG00000102683", key: "ENSG00000102683", value:  "SGCG", text: "SGCG"},
  {"ensembl_id": "ENSG00000148840", key: "ENSG00000148840", value:  "PPRC1", text: "PPRC1"},
  {"ensembl_id": "ENSG00000070718", key: "ENSG00000070718", value:  "AP3M2", text: "AP3M2"},
  {"ensembl_id": "ENSG00000066739", key: "ENSG00000066739", value:  "ATG2B", text: "ATG2B"},
  {"ensembl_id": "ENSG00000130222", key: "ENSG00000130222", value:  "GADD45G", text: "GADD45G"},
  {"ensembl_id": "ENSG00000163106", key: "ENSG00000163106", value:  "HPGDS", text: "HPGDS"},
  {"ensembl_id": "ENSG00000105851", key: "ENSG00000105851", value:  "PIK3CG", text: "PIK3CG"},
  {"ensembl_id": "ENSG00000171608", key: "ENSG00000171608", value:  "PIK3CD", text: "PIK3CD"},
  {"ensembl_id": "ENSG00000133056", key: "ENSG00000133056", value:  "PIK3C2B", text: "PIK3C2B"},
  {"ensembl_id": "ENSG00000102230", key: "ENSG00000102230", value:  "PCYT1B", text: "PCYT1B"},
  {"ensembl_id": "ENSG00000113163", key: "ENSG00000113163", value:  "COL4A3BP", text: "COL4A3BP"},
  {"ensembl_id": "ENSG00000134900", key: "ENSG00000134900", value:  "TPP2", text: "TPP2"},
  {"ensembl_id": "ENSG00000115380", key: "ENSG00000115380", value:  "EFEMP1", text: "EFEMP1"},
  {"ensembl_id": "ENSG00000109819", key: "ENSG00000109819", value:  "PPARGC1A", text: "PPARGC1A"},
  {"ensembl_id": "ENSG00000175220", key: "ENSG00000175220", value:  "ARHGAP1", text: "ARHGAP1"},
  {"ensembl_id": "ENSG00000101146", key: "ENSG00000101146", value:  "RAE1", text: "RAE1"},
  {"ensembl_id": "ENSG00000023909", key: "ENSG00000023909", value:  "GCLM", text: "GCLM"},
  {"ensembl_id": "ENSG00000001084", key: "ENSG00000001084", value:  "GCLC", text: "GCLC"},
  {"ensembl_id": "ENSG00000084073", key: "ENSG00000084073", value:  "ZMPSTE24", text: "ZMPSTE24"},
  {"ensembl_id": "ENSG00000175054", key: "ENSG00000175054", value:  "ATR", text: "ATR"},
  {"ensembl_id": "ENSG00000100038", key: "ENSG00000100038", value:  "TOP3B", text: "TOP3B"},
  {"ensembl_id": "ENSG00000111206", key: "ENSG00000111206", value:  "FOXM1", text: "FOXM1"},
  {"ensembl_id": "ENSG00000136936", key: "ENSG00000136936", value:  "XPA", text: "XPA"},
  {"ensembl_id": "ENSG00000079246", key: "ENSG00000079246", value:  "XRCC5", text: "XRCC5"},
  {"ensembl_id": "ENSG00000122861", key: "ENSG00000122861", value:  "PLAU", text: "PLAU"},
  {"ensembl_id": "ENSG00000172818", key: "ENSG00000172818", value: "OVOL1", text: "OVOL1"},
  {"ensembl_id": "ENSG00000184588", key: "ENSG00000184588", value: "PDE4B", text: "PDE4B"},
  {"ensembl_id": "ENSG00000111252", key: "ENSG00000111252", value: "SH2B3", text: "SH2B3"},
  {"ensembl_id": "ENSG00000149809", key: "ENSG00000149809", value: "TM7SF2", text: "TM7SF2"},
  {"ensembl_id": "ENSG00000111885", key: "ENSG00000111885", value: "MAN1A1", text: "MAN1A1"},
  {"ensembl_id": "ENSG00000116406", key: "ENSG00000116406", value: "EDEM3", text: "EDEM3"},
  {"ensembl_id": "ENSG00000088298", key: "ENSG00000088298", value: "EDEM2", text: "EDEM2"},
  {"ensembl_id": "ENSG00000115221", key: "ENSG00000115221", value: "ITGB6", text: "ITGB6"},
  {"ensembl_id": "ENSG00000158296", key: "ENSG00000158296", value: "SLC13A3", text: "SLC13A3"},
  {"ensembl_id": "ENSG00000164707", key: "ENSG00000164707", value: "SLC13A4", text: "SLC13A4"},
  {"ensembl_id": "ENSG00000141485", key: "ENSG00000141485", value: "SLC13A5", text: "SLC13A5"},
  {"ensembl_id": "ENSG00000112033", key: "ENSG00000112033", value: "PPARD", text: "PPARD"},
  {"ensembl_id": "ENSG00000069667", key: "ENSG00000069667", value: "RORA", text: "RORA"},
  {"ensembl_id": "ENSG00000126368", key: "ENSG00000126368", value: "NR1D1", text: "NR1D1"},
  {"ensembl_id": "ENSG00000126351", key: "ENSG00000126351", value: "THRA", text: "THRA"},
  {"ensembl_id": "ENSG00000077092", key: "ENSG00000077092", value: "RARB", text: "RARB"},
  {"ensembl_id": "ENSG00000025434", key: "ENSG00000025434", value: "NR1H3", text: "NR1H3"},
  {"ensembl_id": "ENSG00000131759", key: "ENSG00000131759", value: "RARA", text: "RARA"},
  {"ensembl_id": "ENSG00000143365", key: "ENSG00000143365", value: "RORC", text: "RORC"},
  {"ensembl_id": "ENSG00000144852", key: "ENSG00000144852", value: "NR1I2", text: "NR1I2"},
  {"ensembl_id": "ENSG00000198963", key: "ENSG00000198963", value: "RORB", text: "RORB"},
  {"ensembl_id": "ENSG00000111424", key: "ENSG00000111424", value: "VDR", text: "VDR"},
  {"ensembl_id": "ENSG00000124762", key: "ENSG00000124762", value: "CDKN1A", text: "CDKN1A"},
  {"ensembl_id": "ENSG00000081800", key: "ENSG00000081800", value: "SLC13A1", text: "SLC13A1"},
  {"ensembl_id": "ENSG00000151491", key: "ENSG00000151491", value: "EPS8", text: "EPS8"},
  {"ensembl_id": "ENSG00000173175", key: "ENSG00000173175", value: "ADCY5", text: "ADCY5"},
  {"ensembl_id": "ENSG00000196591", key: "ENSG00000196591", value: "HDAC2", text: "HDAC2"},
  {"ensembl_id": "ENSG00000186951", key: "ENSG00000186951", value: "PPARA", text: "PPARA"},
  {"ensembl_id": "ENSG00000064835", key: "ENSG00000064835", value: "POU1F1", text: "POU1F1"},
  {"ensembl_id": "ENSG00000112964", key: "ENSG00000112964", value: "GHR", text: "GHR"}
]

const PREDEFINED_GENES = [
  { key: "Pro-Longevity Genes", value: "Pro-Longevity Genes", text: "Pro-Longevity Genes"},
  { key: "Anti-Longevity Genes", value: "Anti-Longevity Genes", text: "Anti-Longevity Genes"},
  { key: "Pro-Lifespan Genes", value: "Pro-Lifespan Genes", text: "Pro-Lifespan Genes"},
  { key: "Anti-Lifespan Genes", value: "Anti-Lifespan Genes", text: "Anti-Lifespan Genes"},
  { key: "DNA Repair genes", value: "DNA Repair genes", text: "DNA Repair genes"},
  { key: "Autophagy genes", value: "Autophagy genes", text: "Autophagy genes"},
  { key: "My custom gene list", value: "My custom gene list", text: "My custom gene list"}
]

export default class SearchPage extends React.Component {

  constructor(props) {
    super(props);
    this.heatmapRef = React.createRef();
    this.state = {      
      selectedGenes: [],
      selectedGenesSymbols: [],
      selectedPredefinedGenes: [],
      selectedGeneIds:[],
      gridOptions: {
        rowData: SAMPLES_VALUES,
        columnDefs: columnDefs,
        rowSelection: 'multiple',
        groupSelectsChildren: true,
        suppressRowClickSelection: true,
        suppressAggFuncInHeader: true,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true
        },
        debug: true,
        // autoGroupColumnDef: {headerName: "Species", field: "organism", width: 200,
        //     cellRenderer:'agGroupCellRenderer',
        //     cellRendererParams: {
        //         checkbox: function(params) {
        //             return params.node.group === true;
        //         }
        //     }
        // },
        // onRowSelected: onRowSelected,
        // onSelectionChanged: onSelectionChanged,
    
        animateRows: true,
        floatingFilter:true
      },
      quickFilterValue: '',
      displayHeatmap: "none"
    }

    this.convertSpeciesToEnsemble.bind(this)
    this.addGenesToDictionary.bind(this)
    this.onChangePredefinedGenes.bind(this)
    this.onChangeGenes.bind(this)
    this.onClickShowResults.bind(this)
    this.isSelectedGene.bind(this)
    this.isSelectedSample.bind(this)
    this.getHeatmapColumnName.bind(this)
    this.refreshSelectedGenes.bind(this)
  }

  async refreshSelectedGenes(){
    var selectedGenes = [];
    var selectedGenesSymbols  = this.state.selectedGenesSymbols;
    var selectedPredefinedGenes =  this.state.selectedPredefinedGenes;
    var selectedGeneIds = this.state.selectedGeneIds;

    selectedGenes = selectedGenesSymbols;
    selectedGenes = selectedGenes.concat(selectedPredefinedGenes);
    selectedGenes = selectedGenes.concat(selectedGeneIds);
    await this.setState({ selectedGenes });
    await this.addGenesToDictionary(selectedGenes);
  }

  async onChangeGenes(e, target){
    console.log(e, target)
    var selected =  await this.convertSpeciesToEnsemble(target.value);
    await this.setState({ selectedGenesSymbols : selected });
    this.refreshSelectedGenes();
  }

  async handleChangeTextarea(e, target){
    var lines  = (e.target.value).split('\n');
    await this.setState({ selectedGeneIds : this.createEnsembleObjectsFromIds(lines) });
    await this.refreshSelectedGenes();
  }

  async addGenesToDictionary(currentSelection){
    var oldGeneSelection = this.state.selectedGenes;
    if(oldGeneSelection == null || oldGeneSelection.length == 0){
      await this.setState({selectedGenes: currentSelection})
    } else {
      for(var i = 0; i < currentSelection.length; i++){
        console.log(i, currentSelection[i]);
        if(this.isSelectedGene(currentSelection[i].ensembl_id) == false){
          oldGeneSelection.push(currentSelection[i]);
          await this.setState({ selectedGenes: oldGeneSelection });
        }    
      }
      await this.setState({ selectedGenes: oldGeneSelection });
    }
  }

  createEnsembleObjectsFromIds(ids){
    var result = [];
    for(var i = 0; i < ids.length; i++){
       var object = {
        "ensembl_id": ids[i],
        "key":  ids[i],
        "name": ENSEMBL_TO_NAME[ids[i]],
        "value": ENSEMBL_TO_NAME[ids[i]],
        "text": ENSEMBL_TO_NAME[ids[i]]
      } 
      result.push(object); 
    }
    return result;
  }

  convertSpeciesToEnsemble(species){
    var speciesHash  = {};
    var result = [];

    for(var i = 0; i < species.length; i++){
      var object = {
        "ensembl_id": SPECIES_TO_ENSEMBL[species[i]][0],
        "key":  SPECIES_TO_ENSEMBL[species[i]][0],
        "name": species[i],
        "value": species[i],
        "text": species[i]  
      } 
      result.push(object);
    }

    return result;
  }

  async onChangePredefinedGenes(e, target){

    switch(target.value){ 
      case "Pro-Longevity Genes":
          await this.setState({ selectedPredefinedGenes : GENAGE_GENES_PRO })
          await this.refreshSelectedGenes()
          break;
      case "Anti-Longevity Genes":
          await this.setState({ selectedPredefinedGenes : GENAGE_GENES_ANTI })
          await this.refreshSelectedGenes()
          break;
      default:
        break;
    }
  }

  isSelectedGene(gene) {
    for(var i = 0; i < this.state.selectedGenes.length; i++){
      if(this.state.selectedGenes[i].ensembl_id == gene)
        return true;
    }
    return false;
  }

  isSelectedSample(sample_id) {
    for(var i = 0; i < this.selectedRows.length; i++){
      if(this.selectedRows[i].run == sample_id)
        return true;
    }
    return false;
  }


 

  getHeatmapColumnName(value){
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
    for(let x = 1; x < words.length; x++){
      curr = curr + words[x];
    }
    return curr;
  }

  onClickShowResults(){
    this.setState({displayHeatmap: "block"})

    let xValues = [];
    let xIndices = [];
    
    let yValues = [];
    let yIndices = [];

    let zValues = [];

    console.log("show results", this.state.selectedGenes);
    this.selectedRows = this.api.getSelectedRows();

    this.layout = {
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


    for ( var i = 0; i < ALL_X_VALUES.length; i++ ) {
        if(!this.isSelectedSample(ALL_X_VALUES[i]))
                continue;
        
        // xValues.push(ALL_X_VALUES[i]);
        xIndices.push(i);
    }

    for ( var i = 0; i < ALL_Y_VALUES.length; i++ ) {
        if(!this.isSelectedGene(ALL_Y_VALUES[i]))
            continue;
        
        // yValues.push(ALL_Y_VALUES[i]);
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
    //         this.layout.annotations.push(result);
    //     }
    // }

    var speciesHash = {};

    for ( var i = 0; i < ALL_X_VALUES.length; i++ ) {
        for(var j = 0; j < SAMPLES_VALUES.length; j++){
            if(ALL_X_VALUES[i] == SAMPLES_VALUES[j].run){
                                // console.log(ALL_X_VALUES[i], SAMPLES_VALUES[j])                    
                speciesHash[ALL_X_VALUES[i]] = this.getHeatmapColumnName(SAMPLES_VALUES[j].organism + " "+ SAMPLES_VALUES[j].source);

            }

        }
        if(speciesHash[ALL_X_VALUES[i]] == null){
            speciesHash[ALL_X_VALUES[i]] = ALL_X_VALUES[i];
        }
    }
    // console.log("speciesHash", speciesHash);

    //sort ALL_X_VALUES by maximum lifespan descending
    var maximumLifesSpanBySpecies = {};
    for(var i = 0; i < this.selectedRows.length; i++){
        maximumLifesSpanBySpecies[this.selectedRows[i].run] = this.selectedRows[i].maximum_longevity;
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
        if(!this.isSelectedGene(ALL_Y_VALUES[i]))
            continue;
      
        for ( var j = 0; j < ALL_X_VALUES.length; j++ ) {
            if(!this.isSelectedSample(ALL_X_VALUES[j]))
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
            xValues.push(speciesHash[ALL_X_VALUES[j]] + ", " + ALL_X_VALUES[j]);
            yValues.push(ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]);
            zValues.push(allZValues[i][j]);
            this.layout.annotations.push(result);
        }
        alreadyUsedSample = {};
    }

    this.layout.width = Math.max(500, 75 * xIndices.length);
    this.layout.height = Math.max(500, 40 * yIndices.length);

    
    this.data = [{
        x: xValues,
        y: yValues,
        z: zValues,

        colorscale: 'RdBu',
        type: 'heatmap'
    }];

    // console.log(xValues.length, yValues.length, zValues.length);
    // console.log(data,this.layout,xValues,yValues,zValues)
    // console.log(xIndices, yIndices)
    // const heatmapElement = document.getElementById("heatmap");
    console.log(this.heatmapRef.current.el)
    // scrollIntoViewIfNeeded(this.myheatmap.el, {
    //     scrollMode: 'if-needed',
    //     behavior: 'smooth'
    // });
    setTimeout(()=>this.heatmapRef.current.el.scrollIntoView(), 1000)

  }

  quickFilterChange(e) {
    // console.log(e.target.value)
    this.setState({quickFilterValue: e.target.value || ''})
    this.api.setQuickFilter(this.state.quickFilterValue)

    if(!e.target.value){
      this.clearFilter()
    }
  }

  clearFilter() {
    this.api.setFilterModel(null);
  }
  
  onGridReady = (params) => {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  render() {
    return (
      <div className="ui intro">
        <div className="ui main" style={{
            margin: "30px"
          }}>
          {/* <SamplesGrid /> */}
          <div id="SamplesGrid">
            <h3 className="ui header">Select samples</h3>
            <div style={{marginBottom: "5px"}}>
                <div className="ui input" style={{width: "100%"}}>
                    {/* <i className="search icon"></i> */}
                    <input 
                        onChange={this.quickFilterChange.bind(this)}
                        value={this.state.quickFilterValue}
                        type="text" 
                        id="quickFilter" 
                        placeholder="filter everything..."></input>
                    {/* <div className="ui teal button">Search</div> */}
                </div>
                {/* <button onclick="filterLung()">Filter all species by lung</button> */}
                {/* <button onclick="filterRbieti()">Filter all tissues by species rbieti</button>
                <button onclick="clearFilter()" style="margin-left: 10px;">Clear Filter</button> */}
            </div>
            
            <div style={{height: "calc(100% - 25px)"}}>
              <div className="ag-theme-balham" style={ 
                {
                  //width: '600px',//TODO
                  height: '300px'
                } }>
                <AgGridReact
                  onGridReady={this.onGridReady}
                  gridOptions={this.state.gridOptions}>
                </AgGridReact>
              </div>
            </div>
          </div>

          <h3 className="ui header">Choose genes or gene sets</h3>
          <Dropdown
            placeholder='Search gene symbols'
            fluid
            multiple
            search
            selection
            options={GENES}
            onChange={this.onChangeGenes.bind(this)}
          />
          
          <span>or choose a predefined list:</span>
          {/* <div style="width: 50%; display: inline"> */}
          <Dropdown
            placeholder='Select predefined list of genes'
            fluid
            search
            selection
            options={PREDEFINED_GENES}
            onChange={this.onChangePredefinedGenes.bind(this)}
          />
          
        
          <div className="field is-horizontal"  style={{marginTop: "24px"}}>
         
            <div className="field-body" style={{marginTop: "10px"}}>
            <div className="msg-wrapper">
             
            </div>
            </div>
          </div>
          <div className="field is-horizontal">
            <div className="field-label">
            <label className="label">
              
            </label>
            </div>
            <div className="field-body">
            <div className="gene-list-wrapper" style={{marginTop: "10px"}}>
              <p className="or-spacer has-text-primary">Or paste custom gene ids</p> 
              <div className="field">{/**/} <div style={{position: "relative"}}>
              <a className="delete is-small input-clear"></a> 
              <div className="control is-clearfix">
                <textarea 
                style={{
                  width: "400px", 
                  height: "150px"
                  }} 
                onChange={this.handleChangeTextarea.bind(this)}
                placeholder="Please enter gene ids..." 
                name="gene_list" 
                className="textarea"></textarea> 
              </div>
              </div>
              </div>
            </div>
            </div>
            </div>

          {/* <h3 className="ui header">Results - heatmap</h3> */}
          <Button 
            onClick={this.onClickShowResults.bind(this)} 
            positive
            >
            Show results
          </Button>

          <Plotly
            ref={this.heatmapRef}
            data={this.data}
            layout={this.layout}
            style={{
                display: this.state.displayHeatmap,
                overflow: "scroll"
            }}
            />
            {/* ref={(el) => { this.heatmapRef = el; }} */}
            
        </div>
      </div>
    );
  }
}
  




