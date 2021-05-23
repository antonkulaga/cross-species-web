/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/destructuring-assignment */
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import React, {useEffect, useState, } from 'react';
import {Button, Dropdown, Tab, Step, StepContent, Header, Icon, Image, Message, Divider} from 'semantic-ui-react';
import {List, fromJS, OrderedMap, OrderedSet} from "immutable"


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


  const [species, setSpecies] = useState(OrderedMap())
  const [showLoader, setShowLoader] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedGenes, setSelectedGenes] = useState([])
  const [selectedSpecies, setSelectedSpecies] = useState([])

  const [speciesByRun, setSpeciesByRun] = useState(OrderedMap())
  const [samplesRowData, setSamplesRowData] = useState([])
  const [organismList, setOrganismList] =useState([])

  const [data, setData] = useState([])


  const HUMAN = {
    key: 'Human',
    value: 'Human',
    text: 'Human',
    id: 'Homo_sapiens'
  };
  const [selectedOrganism, setSelectedOrganism] = useState(HUMAN.value)

  const [genesBySymbol, setGenesBySymbol] = useState(OrderedMap())
  const [genesById, setGenesById] = useState(OrderedMap())


  //const [genesMap, setGenesMap] = useState([])
  //const [genesMapBySpecies, setGenesMapBySpecies] = useState([])


  const [orthologyData, setOrthologyData] = useState({
    genes: [],
    species: [],
    orthology_types: [],
    orthology_table: {}
  })

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


  /**
   * Using OrderedSet to make values unique and preserving their order
   * @param arr
   * @returns {unknown[]}
   */
  const unique = (arr) => Array.from(OrderedSet(fromJS(arr)).values()).map(x => x.toJS()) //TODO consider switching to something more reasonable


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
            <SpeciesTable selectedRows={selectedRows} selectedSpecies={selectedSpecies} setSelectedSpecies={setSelectedSpecies} unique={unique}> </SpeciesTable>
          </Step.Content>
        </Step>
        <OrthologySelection
            selectedOrganism={selectedOrganism}
            setSelectedOrganism={setSelectedOrganism}
            organismList={organismList}
            selectedRows={selectedRows}
            setShowLoader={setShowLoader}
            hasSelection={hasSelection}
            selectedGenes={selectedGenes} setSelectedGenes={setSelectedGenes}
            genesBySymbol={genesBySymbol} setGenesBySymbol={setGenesBySymbol}
            genesById={genesById} setGenesById={setGenesById}
            unique={unique}
        >

        </OrthologySelection>
        <OrthologyTable
          selectedRows = {selectedRows}
          selectedOrganism = {selectedOrganism}
          selectedSpecies={selectedSpecies}
          orthologyData={orthologyData} setOrthologyData = {setOrthologyData}
          selectedGenes = {selectedGenes}
          setShowLoader={setShowLoader}
          autoSizeAll={autoSizeAll} >
        </OrthologyTable>
        <ExpressionsView data={data} setData={setData} selectedRows = {selectedRows} orthologyData = {orthologyData}> </ExpressionsView>
      </Step.Group>





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