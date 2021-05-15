import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {Divider, Dropdown, Header, Icon, Image, List, Step, Segment, Grid, GridColumn, Tab, Table, TextArea} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {OrderedMap} from "immutable";

//import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
//import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

//import ENSEMBL_TO_NAME from './data/ensemblToName.json'


export const OrthologySelection = (
    {
        organismList, hasSelection, setShowLoader,
        ENSEMBL_TO_NAME, setENSEMBL_TO_NAME,
        SPECIES_TO_ENSEMBL, setSPECIES_TO_ENSEMBL
    }
    ) => {

    const HUMAN = {
        key: 'Human',
        value: 'Human',
        text: 'Human',
        id: 'Homo_sapiens'
    };
    const LIMIT = 100

    const [selectedOrganism, setSelectedOrganism] = useState(HUMAN.value)
    const [lastSearchGenes, setLastSearchGenes] = useState('default')
    const [selectedGenes, setSelectedGenes] = useState([])
    const [selectedGenesByName, setSelectedGenesByName] = useState([])
    const [selectedGenesSymbols, setSelectedGenesSymbols] = useState([])
    const [selectedPredefinedGenes, setSelectedPredefinedGenes] = useState([])
    const [selectedGeneIds, setSelectedGeneIds] = useState([])

    //const [search, setSearch] = useState('')
    const [genesByName, setGenesByName] = useState(OrderedMap())
    const [geneOptionsByName, setGeneOptionsByName] =  useState(OrderedMap())
    const [geneOptions, setGeneOptions] = useState([])

    const [predefinedSets, setPredefinedSets] = useState([])
    const [predefinedGenesOptions, setPredefinedGenesOptions] = useState(OrderedMap())


    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    //TODO: FINISH MOVING TO Orthology Selection


    const makeGeneOption = (gene) => {
        return {
            ensembl_id: gene.ensembl_id,
            key: gene.ensembl_id,
            value: gene.name,
            text: gene.name,
            label: gene.name
        }
    }



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
        const gene_set = target.value
        console.log("gene set is:", gene_set)
        if(predefinedGenesOptions.has(gene_set)){
            const chosen = predefinedGenesOptions.get(gene_set)
            console.log("chosen predefined genes are: ", chosen)
            await setSelectedPredefinedGenes(chosen)
            await refreshSelectedGenes();
            await addSelectedPredefinedGenesToDropdown(chosen);
        } else console.error("selected gene set ", gene_set, " does not exist!")
        /*
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
         */
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
        console.error(" convertSpeciesToEnsemble will be rewritten soon!")
        const selected = await convertSpeciesToEnsemble(values);
        await setSelectedGenesSymbols(selected)
        await refreshSelectedGenes();
        await setSelectedGenesByName(values)
    }

    const onSearchGenes = (values) => {

        const searchTxt = (values.state.search).toUpperCase();
        console.log(searchTxt)
        //let searchTxt = search.toUpperCase(); //TODO fix
        if (searchTxt.length > 1 && lastSearchGenes !== searchTxt) {
            setLastSearchGenes(searchTxt)
            const suggested = geneOptionsByName.filter((value, key) => key.toUpperCase().includes(searchTxt)).take(LIMIT)
            const options = Array.from(suggested.values())
            setGeneOptions(options)
        }
    }

    const applyReferenceOrganism = async (organism) => {
        setShowLoader(true)
        setSelectedOrganism(organism)
        const genes = await getReferenceOrgGenes(organism)
        setGenesByName(genes)
        await setGeneOptionsByName(OrderedMap(genes.map(( ensembl_id, symbol) =>
            ({
                key: ensembl_id,
                value: symbol,
                text: symbol,
                label: symbol
            })
        )))
        setShowLoader(false)
    }

    const onChangeOrganism = async (e, target) => {
        console.log("change or reference organism from:", organisms, " to ", target);
        await applyReferenceOrganism(target.value)
    }

    const getReferenceOrgGenes = async (referenceOrganism) => {
        const genes = await fetch(`/api/getReferenceOrgGenes?referenceOrg=${referenceOrganism}`).then(res => res.json())
        return OrderedMap(genes.map(gene => [gene.symbol, gene.ensembl_id.replace('http://rdf.ebi.ac.uk/resource/ensembl/', "")]))
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

    const loadGeneSuggestions = async () =>{
        setShowLoader(true)
        forceUpdate();
        await applyReferenceOrganism('Homo_sapiens')
        const ensemblToName = await getEnsembleToName()
        setENSEMBL_TO_NAME(ensemblToName)
        setSPECIES_TO_ENSEMBL(_.invertBy(ensemblToName))
        //setSPECIES_TO_ENSEMBL(ens.SPECIES_TO_ENSEMBL)
        const gene_sets = await fetch('/api/getPredefinedGenes').then(res => res.json())
        const predefined = OrderedMap(gene_sets.map(value => [value.key, value]))
        const predefined_options = predefined.map((value, key) => value.genes.map(gene=>makeGeneOption(gene)))
        setPredefinedSets(gene_sets)
        await setPredefinedGenesOptions(predefined_options)
        console.log("KEYS OF PREDEFINED",Array.from(predefined_options.keys()))
        console.log("ENTRIES OF PREDEFINED",Array.from(predefined_options.entries()))
        setShowLoader(false)
    }

    useEffect( ()=>{
        loadGeneSuggestions().then(_ => console.log("gene suggestions loaded"))
    }, [])



    return (
        <Step disabled={hasSelection()} >
            <Icon name='dna' />
            <Step.Content>
                <Step.Title><Header>Choose reference genes</Header></Step.Title>
                <Step.Description>
                    <Segment placeholder>
                        <Grid columns={2} relaxed='very' stackable>
                            <Grid.Column>
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
                                You can search genes by their names name
                                <Select id="select"
                                        placeholder="Search gene symbols"
                                        multi
                                        options={geneOptions}
                                        name="select"
                                        values={selectedGenesByName}
                                        searchFn={onSearchGenes}
                                        onChange={onChangeGenes}
                                />
                            </Grid.Column>

                            <Grid.Column verticalAlign='middle'>
                                <Header>extend your search with predefined gene-sets:</Header>
                                <Dropdown
                                    placeholder="Select predefined list of genes"
                                    fluid
                                    search
                                    selection
                                    options={predefinedSets}
                                    onChange={onChangePredefinedGenes}
                                />
                                <p className="or-spacer has-text-primary">Or paste custom Ensembl gene ids</p>
                                <div className="field">
                                    {/**/}
                                    {' '}
                                    <div style={{ position: 'relative' }}>
                                        <a className="delete is-small input-clear" />
                                        <div className="control is-clearfix">
                                            <TextArea placeholder='Please enter ENSEMBL gene ids...'
                                                onChange={handleChangeTextarea}
                                                name="gene_list"
                                                className="textarea"
                                                style={{
                                                minWidth: '400px',
                                                height: '100px'
                                            }}>
                                            </TextArea>
                                        </div>
                                    </div>
                                </div>
                            </Grid.Column>
                        </Grid>

                        <Divider vertical>And/Or</Divider>
                    </Segment>

                </Step.Description>
            </Step.Content>
        </Step>
    )

}

export default OrthologySelection