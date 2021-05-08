import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {Divider, Dropdown, Header, Icon, Image, List, Step, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";

//import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
//import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

//import ENSEMBL_TO_NAME from './data/ensemblToName.json'


const HUMAN = {
    key: 'Human',
    value: 'Human',
    text: 'Human',
    id: 'Homo_sapiens'
};

//TODO: FINISH MOVING TO Orthology Selection

const PREDEFINED_GENES = [
    { key: 'Yspecies Pro-Longevity Genes', value: 'Yspecies Pro-Longevity Genes', text: 'Yspecies Pro-Longevity Genes' },
    { key: 'Yspecies Top Pro & Anti-Longevity Genes', value: 'Yspecies Top Pro & Anti-Longevity Genes', text: 'Yspecies Top Pro & Anti-Longevity Genes' },
    { key: 'Pro-Longevity Genes', value: 'Pro-Longevity Genes', text: 'Pro-Longevity Genes' },
    { key: 'Anti-Longevity Genes', value: 'Anti-Longevity Genes', text: 'Anti-Longevity Genes' },
    { key: 'Pro-Lifespan Genes', value: 'Pro-Lifespan Genes', text: 'Pro-Lifespan Genes' },
    { key: 'Anti-Lifespan Genes', value: 'Anti-Lifespan Genes', text: 'Anti-Lifespan Genes' },
    { key: 'DNA Repair genes', value: 'DNA Repair genes', text: 'DNA Repair genes' },
    { key: 'Autophagy genes', value: 'Autophagy genes', text: 'Autophagy genes' },
    { key: 'My custom gene list', value: 'My custom gene list', text: 'My custom gene list' }
];

export const OrthologySelection = ({organismList, hasSelection, setShowLoader}) => {

    const [selectedOrganism, setSelectedOrganism] = useState(HUMAN.value)
    const [lastSearchGenes, setLastSearchGenes] = useState('default')
    const [selectedGenes, setSelectedGenes] = useState([])
    const [selectedGenesByName, setSelectedGenesByName] = useState([])
    const [selectedGenesSymbols, setSelectedGenesSymbols] = useState([])
    const [selectedPredefinedGenes, setSelectedPredefinedGenes] = useState([])
    const [selectedGeneIds, setSelectedGeneIds] = useState([])

    const [search, setSearch] = useState('')

    const [allGenes, setAllGenes] =  useState([])
    const [genes, setGenes] =  useState([])
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);



    //REWRITE OF UGLY SHARED GLOBAL VARS
    const [ENSEMBL_TO_NAME, setENSEMBL_TO_NAME] = useState([])
    const [SPECIES_TO_ENSEMBL, setSPECIES_TO_ENSEMBL] = useState([])
    const [GENAGE_GENES_PRO, setGENAGE_GENES_PRO] = useState([])
    const [GENAGE_GENES_ANTI, setGENAGE_GENES_ANTI] = useState([])
    const [YSPECIES_GENES_PRO, setYSPECIES_GENES_PRO] = useState([])
    const [YSPECIES_GENES_TOP, setYSPECIES_GENES_TOP] = useState([])




    const createEnsembleObjectsFromIds = (ids) => {
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


    const onChangePredefinedGenes = async (e, target) => {
        switch (target.value) {
            case 'Pro-Longevity Genes':
                await setSelectedPredefinedGenes(GENAGE_GENES_PRO);
                await refreshSelectedGenes();
                await addSelectedPredefinedGenesToDropdown(GENAGE_GENES_PRO);
                break;
            case 'Yspecies Pro-Longevity Genes':
                await setSelectedPredefinedGenes(YSPECIES_GENES_PRO);
                await refreshSelectedGenes();
                await addSelectedPredefinedGenesToDropdown(YSPECIES_GENES_PRO);
                break;
            case 'Yspecies Top Pro & Anti-Longevity Genes':
                await setSelectedPredefinedGenes(YSPECIES_GENES_TOP);
                await refreshSelectedGenes();
                await addSelectedPredefinedGenesToDropdown(YSPECIES_GENES_TOP);
                break;
            case 'Anti-Longevity Genes':
                await setSelectedPredefinedGenes(GENAGE_GENES_ANTI);
                await refreshSelectedGenes();
                await addSelectedPredefinedGenesToDropdown(GENAGE_GENES_ANTI);
                break;
            default:
                break;
        }
    }

    const addSelectedPredefinedGenesToDropdown = async (genesList) => {
        console.log('addSelectedPredefinedGenesToDropdown', genesList);
        const genesArray = [];
        const currentSelectedGenes = selectedGenesByName
        console.log('addSelectedPredefinedGenesToDropdown current', currentSelectedGenes);

        const genesHash = {};
        for (let i = 0; i < currentSelectedGenes.length; i++) {
            genesHash[currentSelectedGenes[i]] = true;
        }

        for (let i = 0; i < genesList.length; i++) {
            if (genesHash[genesList[i].text]) { continue; }
            genesArray.push(genesList[i]);
        }

        const newSelectedGenes = currentSelectedGenes.concat(genesArray);

        console.log('addSelectedPredefinedGenesToDropdown finish', newSelectedGenes);
        await setSelectedGenesByName(newSelectedGenes)
    }

    const handleChangeTextarea = async (e, target) => {
        const lines = (e.target.value).split('\n');
        await setSelectedGeneIds(createEnsembleObjectsFromIds(lines))
        await refreshSelectedGenes();
        await addSelectedPredefinedGenesToDropdown(selectedGeneIds);
    }

    const isSelectedGene = (gene)=> { //TODO rewrite to just using Map or collectFirst
        for (let i = 0; i < selectedGenes.length; i++) {
            if (selectedGenes[i].ensembl_id === gene) { return true; }
        }
        return false;
    }

    const addGenesToDictionary = async (currentSelection) => {
        const oldGeneSelection = selectedGenes;
        if (oldGeneSelection == null || oldGeneSelection.length === 0) {
            await setSelectedGenes(currentSelection);
        } else {
            for (let i = 0; i < currentSelection.length; i++) {
                // console.log(i, currentSelection[i]);
                if (isSelectedGene(currentSelection[i].ensembl_id) === false) {
                    oldGeneSelection.push(currentSelection[i]);
                    await setSelectedGenes(oldGeneSelection);
                }
            }
            await setSelectedGenes(oldGeneSelection)
        }
    }

    const refreshSelectedGenes = async ()=> {
        console.log("refreshSelectedGenes");
        let selectedGenes = [];

        selectedGenes = selectedGenesSymbols;
        selectedGenes = selectedGenes.concat(selectedPredefinedGenes);
        selectedGenes = selectedGenes.concat(selectedGeneIds);
        let filteredGenes = [];
        let hashGenes = [];
        for(let i = 0; i < selectedGenes.length; i++){
            if(hashGenes[selectedGenes[i].key] == null){
                hashGenes[selectedGenes[i].key] = 1;
            } else {
                continue;
            }
            filteredGenes.push(selectedGenes[i]);
        }
        console.log("filteredGenes", filteredGenes)
        await setSelectedGenes(filteredGenes)
        await addGenesToDictionary(selectedGenes);
    }

    const convertSpeciesToEnsemble = (species) => {
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

    const onChangeGenes = async (values) => {
        console.log('onChangeGenes', values);
        const selected = await convertSpeciesToEnsemble(values);
        await setSelectedGenesSymbols(selected)
        await refreshSelectedGenes();
        await setSelectedGenesByName(values)
    }

    const onSearchGenes = (values) => {
        let searchTxt = search.toUpperCase(); //TODO fix
        if (searchTxt.length >= 1 && lastSearchGenes !== searchTxt) {
            setLastSearchGenes(searchTxt)
            let filteredGenes = [];

            for (let i = 0; i < allGenes.length; i++) {
                const curr = allGenes[i];

                if ((curr.text).indexOf(searchTxt) === 0) {
                    filteredGenes.push(curr);
                }
            }

            if (filteredGenes.length >= 1) {
                setGenes(filteredGenes.slice(0, 50))
            }
        } else {
            // console.log("same search", searchTxt);
        }
    }

    const select_genes_panes = [
        { menuItem: 'By gene names', render: () => <Tab.Pane>
                <Select id="select"
                        placeholder="Search gene symbols"
                        multi
                        options={genes}
                        name="select"
                        values={selectedGenesByName}
                        searchFn={onSearchGenes}
                        onChange={onChangeGenes}
                /> </Tab.Pane>},
        { menuItem: 'From predefined list', render: () => <Tab.Pane>
                <span>or choose a predefined list:</span>
                <Dropdown
                    placeholder="Select predefined list of genes"
                    fluid
                    search
                    selection
                    options={PREDEFINED_GENES}
                    onChange={onChangePredefinedGenes}
                />
            </Tab.Pane> },
        { menuItem: 'By Ensembl ID', render: () => <Tab.Pane>
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
                              height: '100px'
                          }}
                          onChange={handleChangeTextarea}
                          placeholder="Please enter ENSEMBL gene ids..."
                          name="gene_list"
                          className="textarea"
                      />
                            </div>
                        </div>
                    </div>
                </div>


            </Tab.Pane> }
            ]

    const onChangeOrganism = async (e, target) => {
        console.log('onChangeOrganism()');
        setSelectedOrganism(target.value)

        const organisms = organismList;
        console.log(organisms, target);
        for (let i = 0; i < organisms.length; i++) {
            if (organisms[i].value === target.value) {
                console.log(organisms[i], target.value);
                const results = await getReferenceOrgGenes(organisms[i].id);
                //moving side-effects out of get function
                setAllGenes(results)
                setGenes(results.slice(0, 30))
                await setShowLoader(false)
                break;
            }
        }
    }

    const getReferenceOrgGenes = async (referenceOrg) => {
        setShowLoader(true)
        forceUpdate();
        return fetch(`/api/getReferenceOrgGenes?referenceOrg=${referenceOrg}`)
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
                //no more side-effect heavy nonsence in the function that gets!
                return results
            });
    }



    //SOME
    const getGenesPro = () => {
        console.log('getGenesPro');// remove testApi
        return fetch('/api/getGenesPro')
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
                console.log('getGenesPro', results);
                return results
            });
    }

    const getYspeciesGenesPro = async () => {
        console.log('getYspeciesGenesPro');// remove testApi
        return fetch('/api/getYspeciesGenesPro')
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
                console.log('getYspeciesGenesPro', results);
                return results
            });
    }

    const getYspeciesGenesTop = async () => {
        console.log('getYspeciesGenesTop');// remove testApi
        return fetch('/api/getYspeciesGenesTop')
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
                console.log('getYspeciesGenesTop', results);
                return results
            });
    }

    const getGenesAnti = async () => {
        console.log('getGenesAnti');// remove testApi
        return fetch('/api/getGenesAnti')
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
                console.log('getGenesAnti', results);
                return results
            });
    }

    const getEnsembleToName = async ()=>{
        console.log('getEnsembleToName');// remove api
        return fetch('/api/getEnsembleToName')
            .then(res => res.json())
            .then((response) => {
                // this.setState({ samplesRowData : response })
                const result = {ENSEMBL_TO_NAME: response, SPECIES_TO_ENSEMBL: _.invertBy(response)}
                console.log(result)
                return result
            });
    }

    const loadGeneSuggestions = () =>{
        Promise.all([getGenesPro(), getGenesAnti(), getYspeciesGenesPro(), getYspeciesGenesTop(), getEnsembleToName()])
            .then((values) => {
                console.log("ALL SUGGESTIONS LOADED!");
                const [genes_pro, genes_anti, yspecies_pro, yspecies_top, ens] = values
                setGENAGE_GENES_PRO(genes_pro)
                setGENAGE_GENES_ANTI(genes_anti)
                setYSPECIES_GENES_PRO(yspecies_pro)
                setYSPECIES_GENES_TOP(yspecies_top)
                setENSEMBL_TO_NAME(ens.ENSEMBL_TO_NAME)
                setSPECIES_TO_ENSEMBL(ens.SPECIES_TO_ENSEMBL)
        });
    }

    useEffect( ()=>{
        loadGeneSuggestions()
    }, [])



    return (
        <Step disabled={hasSelection()} >
            <Icon name='dna' />
            <Step.Content>
                <Step.Title><Header>Choose genes</Header></Step.Title>
                <Step.Description>

                    <Header>
                        Choose reference organism
                    </Header>
                    <Dropdown
                        placeholder="Human"
                        fluid
                        search
                        selection
                        options={organismList}
                        value={selectedOrganism}
                        onChange={onChangeOrganism}
                    />
                    The reference organism (Human by default) is used as a reference point to select your genes of interest.
                    <Divider horizontal>
                        <Header as='h4'>
                            Select genes in the chosen references organism:
                        </Header>
                    </Divider>
                    <Tab className="fluid" panes={select_genes_panes}> </Tab>
                    You can choose them by symbol, Ensembl ID or use one of the predefined lists of genes we've compiled.
                </Step.Description>
            </Step.Content>
        </Step>
    )

}

export default OrthologySelection