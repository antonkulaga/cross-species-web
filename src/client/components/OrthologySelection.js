import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {
    Divider,
    Dropdown,
    Header,
    Form,
    Icon,
    Image,
    List,
    Step,
    Segment,
    Grid,
    GridColumn,
    Tab,
    Table,
    TextArea,
    Button
} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {OrderedMap, OrderedSet, fromJS} from "immutable";

//import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
//import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

//import ENSEMBL_TO_NAME from './data/ensemblToName.json'


export const OrthologySelection = (
    {
        selectedGenes, setSelectedGenes,
        organismList, hasSelection, setShowLoader, genesBySymbol, setGenesBySymbol, genesById, setGenesById, unique
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
    const [allReferenceGenes, setAllReferenceGenes] =  useState(OrderedMap())
    const [selectedGenesOptions, setSelectedGenesOptions] = useState([])
    const [predefinedSets, setPredefinedSets] = useState([])
    const [predefinedGenes, setPredefinedGenes] = useState(OrderedMap())
    const [selectedGeneSet, setSelectedGeneSet] = useState('')
    const [selectedIds, setSelectedIds] = useState([])

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


    const onChangePredefinedGenes = async (e, target) => {
        const gene_set = target.value
        await setSelectedGeneSet(gene_set)
    }



    const handleChangeTextarea = async (e, target) => {
        const ids = (e.target.value).replace('\n', ',').split(',').map(g=>g.trim())
        await setSelectedIds(ids)
    }

    const onChangeGenes = async (values) => {
        if(values!==selectedGenes){
            console.log('onChangeGenes', values);
            await setSelectedGenes(values)
            console.log("selected genes by names = ", selectedGenes)
            setSelectedGenesOptions([])
        }
    }

    const onSearchGenes = (values) => {

        const searchTxt = (values.state.search).toUpperCase();
        console.log(searchTxt)
        //let searchTxt = search.toUpperCase(); //TODO fix
        if (searchTxt.length > 1 && lastSearchGenes !== searchTxt) {
            setLastSearchGenes(searchTxt)
            const suggested = allReferenceGenes.filter((value, key) => key.toUpperCase().includes(searchTxt)).take(LIMIT)
            const options = Array.from(suggested.values())
            setSelectedGenesOptions(options)
        }
    }

    /**
     * Applis reference organisms and selects all of its genes
     * @param organism
     * @returns {Promise<void>}
     */
    const applyReferenceOrganism = async (organism) => {
        setShowLoader(true)
        setSelectedOrganism(organism)
        const genesBySymbol = await getReferenceOrgGenes(organism)
        setGenesBySymbol(genesBySymbol)
        setGenesById(genesBySymbol.flip())
        await setAllReferenceGenes(OrderedMap(genesBySymbol.map(( ensembl_id, symbol) =>
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
        if(selectedOrganism !== target.value)
        {
            console.log("change or reference organism from:", selectedOrganism, " to ", target.value);
            await applyReferenceOrganism(target.value)
        }
    }

    const getReferenceOrgGenes = async (referenceOrganism) => {
        const genes = await fetch(`/api/getReferenceOrgGenes?referenceOrg=${referenceOrganism}`).then(res => res.json())
        return OrderedMap(genes.map(gene => [gene.symbol, gene.ensembl_id.replace('http://rdf.ebi.ac.uk/resource/ensembl/', "")]))
    }

    const loadGeneSuggestions = async () =>{
        setShowLoader(true)
        forceUpdate();
        await applyReferenceOrganism('Homo_sapiens')
        const gene_sets = await fetch('/api/getPredefinedGenes').then(res => res.json())
        const predefined = OrderedMap(gene_sets.map(value => [value.key, value]))
        const predefined_options = predefined.map((value, key) => value.genes.map(gene=>makeGeneOption(gene)))
        setPredefinedSets(gene_sets)
        await setPredefinedGenes(predefined_options)
        console.log("KEYS OF PREDEFINED",Array.from(predefined_options.keys()))
        setShowLoader(false)
    }

    useEffect( ()=>{
        loadGeneSuggestions().then(_ => console.log("gene suggestions loaded"))
    }, [])

    const addGenes = async (e) => {
        const chosen = (selectedGeneSet==="" || !predefinedGenes.has(selectedGeneSet)) ? []:  predefinedGenes.get(selectedGeneSet)
        const id_options = selectedIds.length === 0 ? []: selectedIds.filter(id =>{
            const exist = genesById.has(id)
            if(!exist) console.warn("could not find gene ", id)
            return exist
        }).map(ensembl_id=>{
            const symbol = genesById.get(ensembl_id)
            return ({
                key: ensembl_id,
                value: symbol,
                text: symbol,
                label: symbol
            })}
            )
        await setSelectedGenes(unique(selectedGenes.concat(chosen).concat(id_options)))
    }



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
                                        options={selectedGenesOptions}
                                        name="select"
                                        values={selectedGenes}
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
                                    values={selectedGeneSet}
                                    options={predefinedSets}
                                    onChange={onChangePredefinedGenes}
                                />
                                <Divider horizontal>
                                    <Header as='h4'>
                                        Or paste custom Ensembl gene ids:
                                    </Header>
                                </Divider>

                                    {/**/}
                                    {' '}
                                    <Form>
                                            <TextArea placeholder='Please enter ENSEMBL gene ids...'
                                                onChange={handleChangeTextarea}
                                                name="gene_list"
                                                className="textarea"
                                                style={{
                                                minWidth: '400px',
                                                height: '100px'
                                            }}>
                                            </TextArea>
                                    </Form>
                                <Button onClick={addGenes}
                                        className="ui positive"
                                        size="large">
                                    Add genes
                                </Button>
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