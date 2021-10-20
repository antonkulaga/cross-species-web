/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/destructuring-assignment */
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

import React, {useEffect, useState, } from 'react';
import {Button, Dropdown, Tab, Step, StepContent, Header, Icon, Image, Message, Divider} from 'semantic-ui-react';
import Immutable, {List, fromJS, OrderedMap, OrderedSet} from "immutable"


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
import {Species, Sample, Orthology, Gene, SelectResults, StringMap, TextOption} from "../shared/models";

import Plotly from 'react-plotly.js';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import Select from 'react-dropdown-select';

import Loader from 'react-loader-spinner';
import CsvDownload from 'react-json-to-csv';
import {SamplesGrid} from "./components/SamplesGrid";
import {SelectedSpecies} from "./components/SelectedSpecies";
import OrthologySelection from "./components/OrthologySelection";
import OrthologyTable from "./components/OrthologyTable";
import ExpressionsView from "./components/ExpressionsView";
import {samples} from "../server/queries";
import {plainToClass} from "class-transformer";
import {OrthologyData} from "../shared/tables";

// import SAMPLES_VALUES from './data/samples_values.json'


// import ALL_X_VALUES from './data/allXValues.json'
// import ALL_Y_VALUES from './data/allYValues.json'

// import GENE_EXPRESSIONS from './data/geneExpressions.json'

class SamplesAndSpecies
{
  speciesMap: OrderedMap<string, Species>
  runToSpeciesHash: OrderedMap<string, Sample>

  constructor(public samples: Array<Sample>, public species: Array<Species>){
    this.speciesMap = OrderedMap<string, Species>(species.map( sp => [sp.species , sp] ))
    this.runToSpeciesHash = OrderedMap<string, Sample>(samples.filter(sample=>this.speciesMap.has(sample.organism)).map(sample => {
      let sp: Species = this.speciesMap.get(sample.organism) as Species //getting species from species Map
      sample.lifespan =  sp.lifespan;
      sample.common_name = sp.common_name;
      sample.mass_g = sp.mass;
      sample.ensembl_url = sp.ensembl_url;
      sample.metabolic_rate = sp.metabolic_rate;
      sample.temperature_kelvin = sp.temperature_kelvin;
      sample.animal_class = sp.animal_class;
      sample.taxon = sp.taxon
      return [sample.run, sample]
    })).sortBy(value=> -value.lifespan!)
  }

}


export const SearchPage = () => {


  const [showLoader, setShowLoader] = useState(false)

  const [samples, setSamples] = useState(new Array<Sample>())
  const [selectedSamples, setSelectedSamples] = useState(new Array<Sample>())

  const [species, setSpecies] = useState(OrderedMap<string, Species>())

  const [selectedSpecies, setSelectedSpecies] = useState(new Array<Species>())

  const [selectedGenes, setSelectedGenes] = useState(new Array<Gene>())

  const [selectedOrganism, setSelectedOrganism] = useState<Species>(Species.human)
  const [referenceGenes, setReferenceGenes] = useState(new Array<Gene>())
  const [orthologyData, setOrthologyData] = useState<OrthologyData>(OrthologyData.empty)


  /**
   * Function that
   * @returns {Promise<*>}
   */
  const getSpecies = (): Promise<Array<Species>> => fetch('/api/species').then(res => res.json()).then(res=> plainToClass(Species, res))

  const getSamples = (): Promise<Array<Sample>> => fetch('/api/samples').then(res => res.json()).then(res=> plainToClass(Sample, res))

  const getSamplesAndSpecies = async (): Promise<SamplesAndSpecies> => {
    console.log('getSamplesAndSpecies request'); // remove api
    const speciesArray: Array<Species> = await getSpecies()
    const samplesArray: Array<Sample> = await getSamples()
    //const speciesNames = speciesArray.map( species => TextOption.fromSpecies(species) )
    return new SamplesAndSpecies(samplesArray, speciesArray)
  }

  const autoSizeAll = (columnApi, skipHeader = false) => {
    const allColumnIds = new Array<string>();
    columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId); //TODO: ask explanations for this line
    });
    columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  const hasSelection = () => { return selectedSamples.length === 0}


  /**
   * Used to do data loading and other sideEffects
   */
  useEffect(()=>{

    getSamplesAndSpecies().then( sampleSpecies => {
      console.log("Loading samples and species")
      setSpecies(sampleSpecies.speciesMap)
      const samplesRowData = Array.from(sampleSpecies.runToSpeciesHash.values())
      console.log("SAMPLES ROW DATA", samplesRowData)
      setSamples( samplesRowData )
    })

    }, [])


  // @ts-ignore
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
            <Step.Title><Header  textAlign='center'>Select Samples</Header></Step.Title>
            <Step.Description>

              <Message color='blue' size="small">Choose RNA-Seq samples of different species to compare with each other</Message>
            </Step.Description>
            <SamplesGrid samples= {samples}
                         selectedSamples= {selectedSamples}
                         setSelectedSamples= {setSelectedSamples}
                         autoSizeAll={autoSizeAll}>
            </SamplesGrid>
            <SelectedSpecies
                selectedRows={selectedSamples}
                selectedSpecies={selectedSpecies}
                setSelectedSpecies={setSelectedSpecies}
               >
            </SelectedSpecies>
          </Step.Content>
        </Step>
        <Step disabled={hasSelection()} >
          <Icon name='dna' />
          <Step.Content style={{ width: `calc(100% - 25px)` }}>
            <Step.Title><Header textAlign='center'>Choose reference genes</Header></Step.Title>
            <OrthologySelection
                species={species}
                selectedOrganism={selectedOrganism}
                setSelectedOrganism={setSelectedOrganism}
                setShowLoader={setShowLoader}
                referenceGenes={referenceGenes} setReferenceGenes={setReferenceGenes}
                selectedGenes={selectedGenes} setSelectedGenes={setSelectedGenes}
            >
            </OrthologySelection>
          </Step.Content>
        </Step>
        <Step disabled={selectedSamples.length === 0} style={{ marginTop: '72px', width: `calc(100% - 25px)`  }} >
          <Icon name='dna' />
          <Step.Content  style={{ marginTop: '72px', width: `calc(100% - 25px)`  }}>
            <Step.Title><Header>Load ortholog genes</Header></Step.Title>
            <OrthologyTable
                selectedSamples= {selectedSamples}
                selectedOrganism = {selectedOrganism.species}
                selectedSpecies={selectedSpecies}
                orthologyData={orthologyData} setOrthologyData = {setOrthologyData}
                selectedGenes = {selectedGenes}
                setShowLoader={setShowLoader}
                autoSizeAll={autoSizeAll}
            >
            </OrthologyTable>
          </Step.Content>
        </Step>
        <Step>
          <Icon name='dna'  />
          <Step.Content id="heatmap_container"   style={{ marginTop: '72px', width: `calc(100% - 25px)`  }}>
            <Step.Title><Header textAlign='center'>Load gene expression</Header></Step.Title>
            <ExpressionsView
                selectedSamples= {selectedSamples}
                orthologyData = {orthologyData}
                setShowLoader={setShowLoader}
                autoSizeAll={autoSizeAll}
            ></ExpressionsView>
          </Step.Content>
        </Step>



      </Step.Group>

    </div>
    {showLoader && <Loader
        type="ThreeDots"
        color="#00BFFF"
        height={200}
        width={200}
        timeout={1000000}
    />}

  </div>)

}

export default SearchPage