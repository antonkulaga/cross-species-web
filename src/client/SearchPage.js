/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/destructuring-assignment */
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import React from 'react';
import { Button, Dropdown } from 'semantic-ui-react';
import './app.css';

// import SamplesGrid from './SamplesGrid'
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import _ from 'lodash';


import Plotly from 'react-plotly.js';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import Select from 'react-dropdown-select';

import Loader from 'react-loader-spinner';


// import SAMPLES_VALUES from './data/samples_values.json'

// import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
// import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

// import ENSEMBL_TO_NAME from './data/ensemblToName.json'

// import ALL_X_VALUES from './data/allXValues.json'
// import ALL_Y_VALUES from './data/allYValues.json'

// import GENE_EXPRESSIONS from './data/geneExpressions.json'

let SAMPLES_VALUES = [];
let GENAGE_GENES_PRO = [];
let GENAGE_GENES_ANTI = [];
let ENSEMBL_TO_NAME = [];
let ALL_X_VALUES = [];
let ALL_Y_VALUES = [];
let GENE_EXPRESSIONS = [];
let allZValues = [];
let hashString = {};

let SPECIES_TO_ENSEMBL = [];

const samplesColumnDefs = [
  {
    headerName: 'Sample',
    field: 'run',
    value: [],
    checkboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: true,
    filterParams: {
      filterOptions: ['contains']
    }
    // width: 130
  },
  {
    headerName: 'Species',
    field: 'organism',
    filterParams: {
      filterOptions: ['contains']
    },
    minWidth: 200
  },
  {
    headerName: 'Common name',
    field: 'common_name',
    filterParams: {
      filterOptions: ['contains']
    },
    minWidth: 200
  },
  {
    headerName: 'Max lifespan',
    field: 'lifespan',
    filterParams: {
      filterOptions: ['contains']
    }
  },
  {
    headerName: 'Tissue',
    field: 'source',
    filterParams: {
      filterOptions: ['contains']
    },
    minWidth: 150
  },
  {
    headerName: 'Sex',
    field: 'sex',
    filterParams: {
      filterOptions: ['contains']
    }
  },
  {
    headerName: 'Sequencer',
    field: 'sequencer',
    filterParams: {
      filterOptions: ['contains']
    },
    minWidth: 200
  },
  {
    headerName: 'Mass (g)',
    field: 'mass_g',
    filterParams: {
      filterOptions: ['contains']
    }
  },
  // {
  //   headerName: 'Metabolic rate',
  //   field: 'mass_gmetabolic_rate',
  //   filterParams: {
  //     filterOptions: ['contains']
  //   }
  // },
  {
    headerName: 'Temp (°C)',
    field: 'temperature_celsius',
    filterParams: {
      filterOptions: ['contains']
    }
  },
  {
    headerName: 'Animal class',
    field: 'animal_class',
    filterParams: {
      filterOptions: ['contains']
    }
  },
  {
    headerName: 'Taxon',
    field: 'taxon',
    filterParams: {
      filterOptions: ['contains']
    }
  },
  {
    headerName: 'Ensembl URL',
    field: 'ensembl_url',
    filterParams: {
      filterOptions: ['contains']
    }
  }
];

const samplesGridOptions = {
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
  animateRows: true,
  floatingFilter: true
};

const orthologyGridOptions = {
  suppressRowClickSelection: true,
  suppressAggFuncInHeader: true,
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true
  },
  debug: true,
  // floatingFilter: true
};

const baseOrthologyColumnDefs = [
  {
    headerName: 'Selected gene',
    field: 'selected_gene'
  }
];

const PREDEFINED_GENES = [
  { key: 'Pro-Longevity Genes', value: 'Pro-Longevity Genes', text: 'Pro-Longevity Genes' },
  { key: 'Anti-Longevity Genes', value: 'Anti-Longevity Genes', text: 'Anti-Longevity Genes' },
  { key: 'Pro-Lifespan Genes', value: 'Pro-Lifespan Genes', text: 'Pro-Lifespan Genes' },
  { key: 'Anti-Lifespan Genes', value: 'Anti-Lifespan Genes', text: 'Anti-Lifespan Genes' },
  { key: 'DNA Repair genes', value: 'DNA Repair genes', text: 'DNA Repair genes' },
  { key: 'Autophagy genes', value: 'Autophagy genes', text: 'Autophagy genes' },
  { key: 'My custom gene list', value: 'My custom gene list', text: 'My custom gene list' }
];

const HUMAN = {
  key: 'Human',
  value: 'Human',
  text: 'Human',
  id: 'Homo_sapiens'
};

export default class SearchPage extends React.Component {
  constructor(props) {
    super(props);
    this.heatmapRef = React.createRef();
    this.state = {
      species: [],
      showLoader: false,
      data: null,
      selectedGenes: [],
      genesFromOrthology: [],
      runsFromOrthology: [],
      selectedGenesByName: [],
      selectedGenesSymbols: [],
      selectedPredefinedGenes: [],
      genesMap:[],
      runToSpeciesHash:[],
      genesMapBySpecies:[],
      selectedGeneIds: [],
      selectedOrganism: HUMAN.value,
      organismList: [],
      samplesRowData: [],
      genes: [],
      allGenes: [],
      lastSearchGenes: 'default',
      quickFilterValue: '',
      displayHeatmap: 'none',
      orthologyColumnDefs: [{
        headerName: 'Selected gene',
        field: 'selected_gene'
      }],
      orthologyData: []
    };

    this.convertSpeciesToEnsemble.bind(this);
    this.addGenesToDictionary.bind(this);
    this.onChangePredefinedGenes.bind(this);
    this.onChangeGenes.bind(this);
    this.onSearchGenes.bind(this);
    this.onClickShowResults.bind(this);
    this.isSelectedGene.bind(this);
    this.isSelectedSample.bind(this);
    this.getHeatmapColumnName.bind(this);
    this.refreshSelectedGenes.bind(this);
    this.onChangeOrganism.bind(this);
    this.getReferenceOrgGenes.bind(this);
    this.renderHeatmap.bind(this);
  }

  componentWillMount() {
    this.getSamplesAndSpecies();
    this.getGenesPro();
    this.getGenesAnti();
    this.getEnsembleToName();
    // this.getAllXValues();
    // this.getAllYValues();
    this.getReferenceOrgGenes('Homo_sapiens');
  }

  getGenesPro() {
    console.log('getGenesPro');// remove testApi
    fetch('/api/getGenesPro')
      .then(res => res.json())
      .then((response) => {
        // this.setState({ samplesRowData : response })
        const results = [];
        for (let i = 0; i < response.length; i++) {
          results.push({
            ensembl_id: response[i].ensembl_id,
            key: response[i].ensembl_id,
            value: response[i].name,
            text: response[i].name,
            label: response[i].name
          });
        }
        GENAGE_GENES_PRO = results;
        console.log('getGenesPro', results);
      });
  }

  getGenesAnti() {
    console.log('getGenesAnti');// remove testApi
    fetch('/api/getGenesAnti')
      .then(res => res.json())
      .then((response) => {
        // this.setState({ samplesRowData : response })

        const results = [];
        for (let i = 0; i < response.length; i++) {
          results.push({
            ensembl_id: response[i].ensembl_id,
            key: response[i].ensembl_id,
            value: response[i].name,
            text: response[i].name,
            label: response[i].name
          });
        }
        GENAGE_GENES_ANTI = results;
        console.log('getGenesAnti', results);
      });
  }

  getEnsembleToName() {
    console.log('getEnsembleToName');// remove api
    fetch('/api/getEnsembleToName')
      .then(res => res.json())
      .then((response) => {
        // this.setState({ samplesRowData : response })
        ENSEMBL_TO_NAME = response;
        SPECIES_TO_ENSEMBL = _.invertBy(response);
        console.log('SPECIES_TO_ENSEMBL', SPECIES_TO_ENSEMBL);
      });
  }

  // getAllXValues() {
  //   console.log('getAllXValues');// remove api
  //   fetch('/api/getAllXValues')
  //     .then(res => res.json())
  //     .then((response) => {
  //       // this.setState({ rowData : response })
  //       // ALL_X_VALUES = response;
  //     });
  // }

  // getAllYValues() {
  //   console.log('getAllYValues');// remove api
  //   fetch('/api/getAllYValues')
  //     .then(res => res.json())
  //     .then((response) => {
  //       // this.setState({ rowData : response })
  //       // ALL_Y_VALUES = response;
  //     });
  // }

  async getGeneExpression(runs, genes) {

    console.log('getExpressions runs and gense', runs, genes);
    
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

    var allYValues = [];
    var allXValues = []
    var hashYValues = [];
    var hashXValues = [];
    var allXValues = [];
    var hashEnsembleName = [];

    allYValues = Object.keys(this.state.genesMap);

    console.log("allYValuesAl", allYValues);


    // for(var i = 0; i < GENE_EXPRESSIONS.length; i++){
    //   console.log("ensemble gene name", ENSEMBL_TO_NAME[GENE_EXPRESSIONS[i].gene],GENE_EXPRESSIONS[i].genes );
    //   if(hashYValues[ENSEMBL_TO_NAME[GENE_EXPRESSIONS[i].gene]] == null && ENSEMBL_TO_NAME[GENE_EXPRESSIONS[i].gene].length > 1){
    //     allYValues.push(ENSEMBL_TO_NAME[GENE_EXPRESSIONS[i].gene]);
    //     hashYValues[ENSEMBL_TO_NAME[GENE_EXPRESSIONS[i].gene]] = true;
    //   }
    // }

    for(var i = 0; i < GENE_EXPRESSIONS.length; i++){ 
      if(hashXValues[GENE_EXPRESSIONS[i].run] == null){
        allXValues.push(GENE_EXPRESSIONS[i].run);
        hashXValues[GENE_EXPRESSIONS[i].run] = true;  
      }
    }

    var speciesByRun = this.state.runToSpeciesHash;
    var genesMappedBySpecies = this.state.genesMapBySpecies;
    console.log("speciesByRun", speciesByRun);
    console.log("genesMappedBySpecies", genesMappedBySpecies);
    for(var i = 0; i < allXValues.length; i++){
      var currentSample = allXValues[i];
      for(var j = 0; j < allYValues.length; j++) {
        var currentGene = allYValues[j];

        var speciesName = speciesByRun[currentSample];
        console.log('dsgsdgs',speciesName, currentGene + speciesName);
        var genesFromOrthologyTable = (genesMappedBySpecies[currentGene + speciesName]);
        if(genesFromOrthologyTable == null){
          if( hashString[currentSample] == null){
             hashString[currentSample] = [];
          }
          hashString[currentSample][currentGene] = "0.00";
          continue;
        } 
        var genesFromOrthologyTable = genesFromOrthologyTable.split(',');
        console.log('xxx', genesFromOrthologyTable);


        var found = false;
        for(var k = 0; k < genesFromOrthologyTable.length; k++){
          for(var y = 0 ; y < GENE_EXPRESSIONS.length; y++){
            if(GENE_EXPRESSIONS[y].run == currentSample &&
              GENE_EXPRESSIONS[y].gene == genesFromOrthologyTable[k]){
              console.log("SSSSSS");
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

        // var found = false;
        // for(var k = 0; k < GENE_EXPRESSIONS.length; k++){
        //   if(GENE_EXPRESSIONS[k].run == currentSample && 
        //     ENSEMBL_TO_NAME[GENE_EXPRESSIONS[k].gene] == currentGene){
        //      if(hashString[currentSample] == null){
        //       hashString[currentSample] = [];
        //       hashString[currentSample][currentGene] = [];
        //       hashString[currentSample][currentGene] = GENE_EXPRESSIONS[k].tpm;
        //     } else {  
        //       hashString[currentSample][currentGene] = [];
        //       hashString[currentSample][currentGene] = GENE_EXPRESSIONS[k].tpm;
        //     }
        //     found = true;
        //   }
         
        // }
       if(found == false){
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

    // for(var i = 0; i < GENE_EXPRESSIONS.length; i++){ 
    //   if(hashXValues[GENE_EXPRESSIONS[i].run] == null){
    //     allXValues.push(GENE_EXPRESSIONS[i].run);
    //     hashXValues[GENE_EXPRESSIONS[i].run] = true;
        
    //   }

    //   if(hashString[GENE_EXPRESSIONS[i].run] == null){
    //     hashString[GENE_EXPRESSIONS[i].run] = [];
    //     hashString[GENE_EXPRESSIONS[i].run][GENE_EXPRESSIONS[i].gene] = [];
    //     hashString[GENE_EXPRESSIONS[i].run][GENE_EXPRESSIONS[i].gene] = GENE_EXPRESSIONS[i].tpm;
    //   } else {
    //     hashString[GENE_EXPRESSIONS[i].run][GENE_EXPRESSIONS[i].fgene] = [];
    //     hashString[GENE_EXPRESSIONS[i].run][GENE_EXPRESSIONS[i].gene] = GENE_EXPRESSIONS[i].tpm;
    //   }
    // }
    // var k = 0;
    // allZValues = [];
    // for(var i = 0; i < allXValues.length; i++){
    //   for(var j = 0; j < allYValues.length; j++){ 
    //     // console.log(j, GENE_EXPRESSIONS[j].tpm);
    //     // /allZValues[i].push(GENE_EXPRESSIONS[j].tpm);
    //     console.log(allZValues[k]);
    //     allZValues.push(hashString[allXValues[i]][allYValues[j]]);

    //   }
    // }
    console.log("allZValues", allZValues);
    ALL_X_VALUES = allXValues; ALL_Y_VALUES = allYValues;

    this.renderHeatmap();
    this.setState({showLoader: false});
  }


  getSamplesAndSpecies() {
    console.log('getSamplesAndSpecies request');// remove api
    fetch('/api/getSamples')
      .then(res => res.json())
      .then((samples) => {
        console.log('samples', samples);// remove api
        fetch('/api/getSpecies')
          .then(res => res.json())
          .then((species) => {
            console.log('species:', species);
            this.setState({ species });
            const speciesNames = [];
            const runToSpeciesHash = [];
            for (let i = 0; i < species.length; i++) {
              speciesNames.push({
                key: species[i].common_name,
                value: species[i].common_name,
                text: species[i].common_name,
                id: species[i].id
              });

              for (let j = 0; j < samples.length; j++) {
                if (samples[j].organism === species[i].id) {
                  samples[j].lifespan = species[i].lifespan;
                  samples[j].common_name = species[i].common_name;
                  samples[j].mass_g = species[i].mass_g;
                  samples[j].ensembl_url = species[i].ensembl_url;
                  samples[j].metabolic_rate = species[i].metabolic_rate;
                  samples[j].temperature_celsius = parseFloat(species[i].temperature_kelvin)
                                                   - 273.15;
                  samples[j].animal_class = species[i].animal_class;
                  samples[j].taxon = species[i].taxon;
                }
                runToSpeciesHash[samples[j].run] = samples[j].organism;
              }
            }
            console.log('speciesNames', speciesNames);
            console.log('samples', samples);
            this.setState({ organismList: speciesNames });
            this.setState({ samplesRowData: samples });
            this.setState({ runToSpeciesHash })
            SAMPLES_VALUES = samples;
          });
      });

  }

  async refreshSelectedGenes() {
    console.log("refreshSelectedGenes");
    let selectedGenes = [];
    const { selectedGenesSymbols } = this.state;
    const { selectedPredefinedGenes } = this.state;
    const { selectedGeneIds } = this.state;

    selectedGenes = selectedGenesSymbols;
    selectedGenes = selectedGenes.concat(selectedPredefinedGenes);
    selectedGenes = selectedGenes.concat(selectedGeneIds);
    var filteredGenes = [];
    var hashGenes = [];
    for(var i = 0; i < selectedGenes.length; i++){
      if(hashGenes[selectedGenes[i].key] == null){
        hashGenes[selectedGenes[i].key] = 1;
      } else {
        continue;
      }
      filteredGenes.push(selectedGenes[i]);
    }
    console.log("filteredGenes", filteredGenes)
    await this.setState({ selectedGenes: filteredGenes });
    await this.addGenesToDictionary(selectedGenes);
  }

  async onChangeGenes(values) {
    console.log('onChangeGenes', values);
    const selected = await this.convertSpeciesToEnsemble(values);
    await this.setState({ selectedGenesSymbols: selected });
    await this.refreshSelectedGenes();
    await this.setState({ selectedGenesByName: values });
  }


  onSearchGenes(values) {
    // console.log("onSearchGenes", values.state.search);
    var searchTxt = (values.state.search).toUpperCase();
    // console.log(this.state.genes);
    const { lastSearchGenes } = this.state;
    if (searchTxt.length >= 1 && lastSearchGenes != searchTxt) {
      // console.log("XXXXXX");
      this.setState({ lastSearchGenes: searchTxt });
      const { allGenes } = this.state;
      const filteredGenes = [];

      for (let i = 0; i < allGenes.length; i++) {
        const curr = allGenes[i];

        if ((curr.text).indexOf(searchTxt) == 0) {
          filteredGenes.push(curr);
        }
      }

      if (filteredGenes.length >= 1) {
        this.setState({ genes: filteredGenes.slice(0, 50) });
      }
    } else {
      // console.log("same search", searchTxt);
    }
  }

  async handleChangeTextarea(e, target) {
    const lines = (e.target.value).split('\n');
    await this.setState({ selectedGeneIds: this.createEnsembleObjectsFromIds(lines) });
    await this.refreshSelectedGenes();
    await this.addSelectedPredefinedGenesToDropdown(await this.state.selectedGeneIds);
  }

  async addGenesToDictionary(currentSelection) {
    const oldGeneSelection = this.state.selectedGenes;
    if (oldGeneSelection == null || oldGeneSelection.length == 0) {
      await this.setState({ selectedGenes: currentSelection });
    } else {
      for (let i = 0; i < currentSelection.length; i++) {
        // console.log(i, currentSelection[i]);
        if (this.isSelectedGene(currentSelection[i].ensembl_id) == false) {
          oldGeneSelection.push(currentSelection[i]);
          await this.setState({ selectedGenes: oldGeneSelection });
        }
      }
      await this.setState({ selectedGenes: oldGeneSelection });
    }
  }

  createEnsembleObjectsFromIds(ids) {
    const result = [];
    for (let i = 0; i < ids.length; i++) {
      const object = {
        ensembl_id: ids[i],
        key: ids[i],
        name: ENSEMBL_TO_NAME[ids[i]],
        value: ENSEMBL_TO_NAME[ids[i]],
        text: ENSEMBL_TO_NAME[ids[i]],
        label: ENSEMBL_TO_NAME[ids[i]]
      };
      result.push(object);
    }
    return result;
  }

  async onChangeOrganism(e, target) {
    console.log('onChangeOrganism()');
    // console.log(e, target);
    this.setState({ selectedOrganism: target.value });
    // await this.refreshSelectedGenes();ReferenceOrgGenes(target.value[0])

    const organisms = this.state.organismList;
    console.log(organisms, target);
    for (let i = 0; i < organisms.length; i++) {
      if (organisms[i].value === target.value) {
        console.log(organisms[i], target.value);
        this.getReferenceOrgGenes(organisms[i].id);
        break;
      }
    }
  }

  async getReferenceOrgGenes(referenceOrg) {
    fetch(`/api/getReferenceOrgGenes?referenceOrg=${referenceOrg}`)
      .then(res => res.json())
      .then((response) => {
        console.log('getReferenceOrgGenes', response);

        const results = [];
        const hash = [];
        for (let i = 0; i < response.length; i++) {
          const ensembl_id = (response[i].ensembl_id).split('http://rdf.ebi.ac.uk/resource/ensembl/')[1];
          if (hash[response[i].symbol] == null) {
            results.push({
              ensembl_id,
              key: ensembl_id,
              value: response[i].symbol,
              text: response[i].symbol,
              label: response[i].symbol
            });
            hash[response[i].symbol] = true;
          }
        }
        this.setState({ allGenes: results });
        this.setState({ genes: results.slice(0, 30) });
      });
  }

  convertSpeciesToEnsemble(species) {
    const speciesHash = {};
    const result = [];
    console.log('convertSpeciesToEnsemble', species[0].value);
    console.log('SPECIES_TO_ENSEMBL', SPECIES_TO_ENSEMBL[species[0].value][0]);
    for (let i = 0; i < species.length; i++) {
      const object = {
        ensembl_id: SPECIES_TO_ENSEMBL[species[i].value][0],
        key: SPECIES_TO_ENSEMBL[species[i].value][0],
        name: species[i],
        value: species[i],
        text: species[i],
        label: species[i]
      };
      result.push(object);
    }

    return result;
  }

  async addSelectedPredefinedGenesToDropdown(genesList) {
    console.log('addSelectedPredefinedGenesToDropdown', genesList);
    const genesArray = [];
    const currentSelectedGenes = await this.state.selectedGenesByName;
    console.log('addSelectedPredefinedGenesToDropdown current', currentSelectedGenes);

    const genesHash = {};
    for (var i = 0; i < currentSelectedGenes.length; i++) {
      genesHash[currentSelectedGenes[i]] = true;
    }

    for (var i = 0; i < genesList.length; i++) {
      if (genesHash[genesList[i].text]) { continue; }
      genesArray.push(genesList[i]);
    }

    const newSelectedGenes = currentSelectedGenes.concat(genesArray);

    console.log('addSelectedPredefinedGenesToDropdown finish', newSelectedGenes);
    await this.setState({ selectedGenesByName: newSelectedGenes });
  }

  async onChangePredefinedGenes(e, target) {
    switch (target.value) {
      case 'Pro-Longevity Genes':
        await this.setState({ selectedPredefinedGenes: GENAGE_GENES_PRO });
        await this.refreshSelectedGenes();
        await this.addSelectedPredefinedGenesToDropdown(GENAGE_GENES_PRO);
        break;
      case 'Anti-Longevity Genes':
        await this.setState({ selectedPredefinedGenes: GENAGE_GENES_ANTI });
        await this.refreshSelectedGenes();
        await this.addSelectedPredefinedGenesToDropdown(GENAGE_GENES_ANTI);
        break;
      default:
        break;
    }
  }

  isSelectedGene(gene) {
    for (let i = 0; i < this.state.selectedGenes.length; i++) {
      if (this.state.selectedGenes[i].ensembl_id == gene) { return true; }
    }
    return false;
  }

  isSelectedSample(sample_id) {
    for (let i = 0; i < this.selectedRows.length; i++) {
      if (this.selectedRows[i].run == sample_id) { return true; }
    }
    return false;
  }

  getHeatmapColumnName(value) {
    let curr = value;
    const words = curr.split(' ');
    for (let y = 0; y < words.length - 1; y++) {
      words[y] += ' ';
    }
    // console.log(words);
    if (words.length > 1) {
      curr = `${words[0][0]} `;
    } else if (words.length == 1) {
      curr = words[0];
    }
    for (let x = 1; x < words.length; x++) {
      curr += words[x];
    }
    return curr;
  }

  async getOrthology() {
    const selectedSamples = this.samplesGridApi.getSelectedRows();
    
    this.speciesToSRR = {};
    selectedSamples.forEach((sample) => {
      if(!this.speciesToSRR[sample.organism])
        this.speciesToSRR[sample.organism] = [];
      else
        this.speciesToSRR[sample.organism].push(sample.run);
    });
    this.selectedSpecies = Object.keys(this.speciesToSRR);

    await this.setState({
      orthologyColumnDefs: baseOrthologyColumnDefs.concat(
        this.selectedSpecies.map(species => ({
          headerName: species,
          field: species
        }))
      )
    });

    let orthologyResponse = await fetch('/api/getOrthologyOne2Many', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        genes: this.state.selectedGenes.map(gene => gene.ensembl_id),
        samples: selectedSamples
      })
    });
    orthologyResponse = await orthologyResponse.json();

    console.log("orthologyResponse", orthologyResponse);

    var genes = [];
    var runs = [];
    for(var key in orthologyResponse) {
      var array = orthologyResponse[key];

      for(var i = 0; i < array.length; i++){
        genes.push(array[i].ortholog_id);
        runs.push(array[i].ortholog_species);
        ENSEMBL_TO_NAME[array[i].ortholog_id] = array[i].ortholog_symbol;
      }
    } 
    
    await this.setState({ genesFromOrthology: genes, runsFromOrthology: runs });
    console.log("genesFromOrthology", genes);
    console.log("runsFromOrthology", runs);

    var genesMap = [];
    var genesMapBySpecies = [];
    await this.setState({
      orthologyData: Object.keys(orthologyResponse).map((geneId) => {
        const row = {};
        row.selected_gene = geneId;
        orthologyResponse[geneId].forEach((ortholog) => {
          if (!row[ortholog.ortholog_species]) {
            row[ortholog.ortholog_species] = ortholog.ortholog_id;
            genesMap[geneId] = ortholog.ortholog_id;
            genesMapBySpecies[geneId + ortholog.ortholog_species] = ortholog.ortholog_id;
          }
          else {
            row[ortholog.ortholog_species] += `, ${ortholog.ortholog_id}`;
            genesMap[geneId] +=`,${ortholog.ortholog_id}`;
            genesMapBySpecies[geneId + ortholog.ortholog_species] += `,${ortholog.ortholog_id}`
          }
        });
        return row;
      })
    });


    this.setState({
      showOrthology: true,
      genesMap: genesMap,
      genesMapBySpecies: genesMapBySpecies
    });
  }

  renderHeatmap() {
    const xValues = [];
    const xIndices = [];

    const yValues = [];
    const yIndices = [];

    const zValues = [];

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
      }
    };


    for (var i = 0; i < ALL_X_VALUES.length; i++) {
      // if (!this.isSelectedSample(ALL_X_VALUES[i])) { continue; }

      // xValues.push(ALL_X_VALUES[i]);
      xIndices.push(i);
    }

    for (var i = 0; i < ALL_Y_VALUES.length; i++) {
      // if (!this.isSelectedGene(ALL_Y_VALUES[i])) { continue; }

      // yValues.push(ALL_Y_VALUES[i]);
      yIndices.push(i);
    }

    const speciesHash = {};

    for (var i = 0; i < ALL_X_VALUES.length; i++) {
      for (var j = 0; j < SAMPLES_VALUES.length; j++) {
        if (ALL_X_VALUES[i] == SAMPLES_VALUES[j].run) {
          // console.log(ALL_X_VALUES[i], SAMPLES_VALUES[j])
          speciesHash[ALL_X_VALUES[i]] = this.getHeatmapColumnName(`${SAMPLES_VALUES[j].organism} ${SAMPLES_VALUES[j].source}`);
        }
      }
      if (speciesHash[ALL_X_VALUES[i]] == null) {
        speciesHash[ALL_X_VALUES[i]] = ALL_X_VALUES[i];
      }
    }
    console.log("speciesHash", speciesHash);

    // sort ALL_X_VALUES by maximum lifespan descending
    // const maximumLifesSpanBySpecies = {};
    // for (var i = 0; i < this.selectedRows.length; i++) {
    //   maximumLifesSpanBySpecies[this.selectedRows[i].run] = this.selectedRows[i].maximum_longevity;
    // }
    // for (var i = 0; i < ALL_X_VALUES.length - 1; i++) {
    //   for (var j = i + 1; j < ALL_X_VALUES.length; j++) {
    //     if (maximumLifesSpanBySpecies[ALL_X_VALUES[i]] == null) {
    //       maximumLifesSpanBySpecies[ALL_X_VALUES[i]] = 0;
    //     }

    //     if (maximumLifesSpanBySpecies[ALL_X_VALUES[j]] == null) {
    //       maximumLifesSpanBySpecies[ALL_X_VALUES[j]] = 0;
    //     }

    //     if (maximumLifesSpanBySpecies[ALL_X_VALUES[j]] > maximumLifesSpanBySpecies[ALL_X_VALUES[i]]) {
    //       const aux = ALL_X_VALUES[j];
    //       ALL_X_VALUES[j] = ALL_X_VALUES[i];
    //       ALL_X_VALUES[i] = aux;
    //     }
    //   }
    // }  
    console.log("allYValues", ALL_Y_VALUES);
    console.log(ALL_Y_VALUES.length, ALL_X_VALUES.length);
    let alreadyUsedSample = {};
    let alreadyUsedGene = {}
    let hash = {};
    for (var i = 0; i < ALL_Y_VALUES.length; i++) {
      hash[i] = [];
      // if (!this.isSelectedGene(ALL_Y_VALUES[i])) { continue; }
      // if(alreadyUsedGene[ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]] != null){
      //   continue;
      // } else {
      //   alreadyUsedGene[ENSEMBL_TO_NAME[ALL_Y_VALUES[i]]] = 1;
      // }

      for (var j = 0; j < ALL_X_VALUES.length; j++) {
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


        const currentValue = parseFloat(allZValues[i][j]);// TODO: parseInt?
        // if (currentValue != 0.0) {
          var textColor = 'white';
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
        this.layout.annotations.push(result);
      }

      alreadyUsedSample = {};
    }

    this.layout.width = Math.max(500, 75 * xIndices.length);
    this.layout.height = Math.max(500, 40 * yIndices.length);

    // const logColors = zValues.map(x =>
    // // TODO: parseInt?
    // // if(!x) return 0;
    //   Math.log(x + 1)// TODO: divide / Math.log(10);
    // );
    // console.log(logColors);

    // const maxVal = parseInt(
    //   Math.exp(
    //     zValues.reduce((x, y) => {
    //       if (x < y) { return y; }
    //       return x;
    //     })
    //   ) - 1
    // );
    // // const minVal = zValues.reduce((x,y) => {if(x>y) return Math.exp(y)-1; return Math.exp(x)-1;})
    // const tickVals = [0];
    // for (let i = 1; i < 5; i++) {
    //   tickVals.push(tickVals[i - 1] + maxVal / 5);
    // }
    // console.log(maxVal, tickVals);

    // this.data = [{
    //   x: xValues,
    //   y: yValues,
    //   z: zValues,

    //   colorscale: 'RdBu',
    //   // color: logColors,
    //   showscale: false,
    //   type: 'heatmap',
    //   // colorbar: {
    //   //     tickvals: tickVals,
    //   //     ticks: 'outside'
    //   // }
    // }];

    this.setState({data: [{
      x: xValues,
      y: yValues,
      z: zValues,

      colorscale: 'RdBu',
      // color: logColors,
      showscale: false,
      type: 'heatmap',
      // colorbar: {
      //     tickvals: tickVals,
      //     ticks: 'outside'
      // }
    }]})

    console.log(xValues.length, yValues.length, zValues.length);
    console.log(this.state.data,this.layout,xValues,yValues,zValues)
    console.log(xIndices, yIndices)
    // const heatmapElement = document.getElementById("heatmap");
    // console.log(this.heatmapRef.current.el);
    // scrollIntoViewIfNeeded(this.myheatmap.el, {    
    //     scrollMode: 'if-needed',
    //     behavior: 'smooth'
    // });
    setTimeout(() => this.heatmapRef.current.el.scrollIntoView(), 3000);

  }

  async onClickShowResults() {
   

     //filter selectedGenes  
         this.setState({showLoader: false})

    this.setState({showLoader: true})
    this.forceUpdate();
    await this.getOrthology();

    console.log("click show results", this.state.showLoader);


    this.setState({ displayHeatmap: 'block' });
   
    // console.log('show results', this.state.selectedGenes);

    this.selectedRows = this.samplesGridApi.getSelectedRows();

    console.log("show results selected genes", this.state.selectedGenes);
    console.log("show results selected runs", this.samplesGridApi.getSelectedRows());

    var selectedGenes = this.state.selectedGenes;
    var selectedRows = this.samplesGridApi.getSelectedRows();
    var runs = [];
    var genes = [];
    var runsHash = [];
    var runsFromOrthology = this.state.runsFromOrthology;

    for(var i = 0; i < selectedRows.length; i++){
      runs.push(selectedRows[i].run);
    }

    genes = this.state.genesFromOrthology;
    await this.getGeneExpression(runs, genes);     
  }

  quickFilterChange(e) {
    // console.log(e.target.value)
    this.setState({ quickFilterValue: e.target.value || '' });
    this.samplesGridApi.setQuickFilter(this.state.quickFilterValue);

    if (!e.target.value) {
      this.clearFilter();
    }
  }

  clearFilter() {
    this.samplesGridApi.setFilterModel(null);
  }

  autoSizeAll(columnApi, skipHeader = false) {
    const allColumnIds = [];
    columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });

    columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  onSamplesGridReady = (params) => {
    this.samplesGridApi = params.api;
    this.samplesColumnApi = params.columnApi;
    this.autoSizeAll(this.samplesColumnApi);
  }

  onOrthologyGridReady = (params) => {
    // this.samplesGridApi = params.api;
    // this.samplesColumnApi = params.columnApi;
    this.autoSizeAll(params.columnApi);
  }

  renderOrthology = () => {
    if (this.state.showOrthology === true) return (
      <div id="OrthologyGrid" style={{ marginTop: '72px' }}>
        <h3 className="ui header">Orthology table</h3>
        <div
          className="ag-theme-balham"
          style={{
            height: '300px'
          }}
        >
          <AgGridReact
            onGridReady={this.onOrthologyGridReady}
            rowData={this.state.orthologyData}
            columnDefs={this.state.orthologyColumnDefs}
            gridOptions={orthologyGridOptions}
          />
        </div>
      </div>
    );
    
    return false;
  }

  render() {
    const {
      selectedGenesByName, selectedOrganism, organismList, genes
    } = this.state;
    return (
      <div className="ui intro">
         {this.state.showLoader && <Loader
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
        <div
          className="ui main"
          style={{
            margin: '30px'
          }}
        >
          {/* <SamplesGrid /> */}


          <div id="SamplesGrid">
            <h3 className="ui header">Select samples</h3>
            <div style={{ marginBottom: '5px' }}>
              <div className="ui input" style={{ width: '100%' }}>
                {/* <i className="search icon"></i> */}
                <input
                  onChange={this.quickFilterChange.bind(this)}
                  value={this.state.quickFilterValue}
                  type="text"
                  id="quickFilter"
                  placeholder="filter everything..."
                />
                {/* <div className="ui teal button">Search</div> */}
              </div>
              {/* <button onclick="filterLung()">Filter all species by lung</button> */}
              {/* <button onclick="filterRbieti()">Filter all tissues by species rbieti</button>
                <button onclick="clearFilter()" style="margin-left: 10px;">Clear Filter</button> */}
            </div>

            <div style={{ height: 'calc(100% - 25px)' }}>
              <div
                className="ag-theme-balham"
                style={
                {
                  // width: '600px',//TODO
                  height: '300px'
                }}
              >
                <AgGridReact
                  onGridReady={this.onSamplesGridReady}
                  rowData={this.state.samplesRowData}
                  columnDefs={samplesColumnDefs}
                  gridOptions={samplesGridOptions}
                />
              </div>
            </div>
          </div>

          <h3 className="ui header">Choose reference organism</h3>
          <Dropdown
            placeholder="Human"
            fluid
            search
            selection
            options={organismList}
            value={selectedOrganism}
            onChange={this.onChangeOrganism.bind(this)}
          />

          <h3 className="ui header">Choose genes or gene sets</h3>

          <Select
            placeholder="Search gene symbols"
            multi
            options={genes}
            name="select"
            values={selectedGenesByName}
            searchFn={this.onSearchGenes.bind(this)}
            onChange={this.onChangeGenes.bind(this)}
          />


          <span>or choose a predefined list:</span>
          {/* <div style="width: 50%; display: inline"> */}
          <Dropdown
            placeholder="Select predefined list of genes"
            fluid
            search
            selection
            options={PREDEFINED_GENES}
            onChange={this.onChangePredefinedGenes.bind(this)}
          />


          <div className="field is-horizontal" style={{ marginTop: '24px' }}>

            <div className="field-body" style={{ marginTop: '10px' }}>
              <div className="msg-wrapper" />
            </div>
          </div>
          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label" />
            </div>
            <div className="field-body">
              <div className="gene-list-wrapper" style={{ marginTop: '10px' }}>
                <p className="or-spacer has-text-primary">Or paste custom gene ids</p>
                <div className="field">
                  {/**/}
                  {' '}
                  <div style={{ position: 'relative' }}>
                    <a className="delete is-small input-clear" />
                    <div className="control is-clearfix">
                      <textarea
                        style={{
                          width: '400px',
                          height: '150px'
                        }}
                        onChange={this.handleChangeTextarea.bind(this)}
                        placeholder="Please enter ENSEMBL gene ids..."
                        name="gene_list"
                        className="textarea"
                      />
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

          { this.renderOrthology() }
        
          <Plotly
            ref={this.heatmapRef}
            data={this.state.data}
            layout={this.layout}
            style={{
              display: this.state.displayHeatmap,
              overflow: 'scroll'
            }}
          />
          {/* ref={(el) => { this.heatmapRef = el; }} */}

        </div>


      </div>
    );
  }
}
