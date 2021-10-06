import React, {useState, useEffect, useCallback, useReducer, Dispatch, SetStateAction} from 'react'
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
import {Gene, GeneResults, Sample, Species, TextOption} from "../../shared/models";

//import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
//import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

//import ENSEMBL_TO_NAME from './data/ensemblToName.json'

type OrthologySelectionInput = {
    children?: JSX.Element | JSX.Element[],
    selectedGenes: Array<TextOption>,
    setSelectedGenes: Dispatch<SetStateAction<Array<TextOption>>>,
    organismList: Array<TextOption>,
    selectedRows: Array<Sample>,
    setShowLoader: Dispatch<SetStateAction<boolean>>,
    genesById: OrderedMap<string,Gene>,
    genesBySymbol: OrderedMap<string, Gene>, setGenesBySymbol: Dispatch<OrderedMap<string, Gene>>
    setGenesById: Dispatch<OrderedMap<string, Gene>>
    selectedOrganism: string, setSelectedOrganism: Dispatch<string>

}

export const OrthologySelection = (
    {
        selectedGenes, setSelectedGenes,
        organismList,
        setShowLoader,
        genesById, setGenesById,
        genesBySymbol, setGenesBySymbol,
        selectedOrganism, setSelectedOrganism
    }: OrthologySelectionInput
    ) => {

    const LIMIT = 100


    const [lastSearchGenes, setLastSearchGenes] = useState('default')
    const [allReferenceGenes, setAllReferenceGenes] =  useState(OrderedMap<string, TextOption>())

    const [selectedGenesOptions, setSelectedGenesOptions] = useState(new Array<TextOption>())
    const [predefinedSets, setPredefinedSets] = useState(new Array<TextOption>())
    const [predefinedGenes, setPredefinedGenes] = useState(OrderedMap<string, Array<TextOption>>())
    const [selectedGeneSet, setSelectedGeneSet] = useState('')
    const [selectedIds, setSelectedIds] = useState([])

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);


    //TODO: FINISH MOVING TO Orthology Selection

    /**
     * get genes for the reference organism
     * @param organism
     */
    const getReferenceOrgGenes = async (organism: string): Promise<Array<Gene>> => {
        return await fetch(`/api/all_genes/${organism}`).then(res => res.json())
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

    //{ props, state, methods }: SelectRenderer<T>) => T[]
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
        const genes: Array<Gene> = await getReferenceOrgGenes(organism)
        const genesBySymbol = OrderedMap<string,Gene>(genes.map(gene =>
            [
                gene.symbol,
                gene
            ]))
        const genesById = OrderedMap<string,Gene>(genes.map(gene =>
            [
                gene.ensembl_short,
                gene
            ]))
        setGenesBySymbol(genesBySymbol)
        setGenesById(genesById)
        //now we have to update genes text options
        await setAllReferenceGenes(OrderedMap(genesBySymbol.map(
            (gene, id) => gene.asTextOption
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



    const loadGeneSuggestions = async () =>{
        setShowLoader(true)
        forceUpdate();
        await applyReferenceOrganism('Homo_sapiens')
        const geneResults: Array<GeneResults> = await fetch('/api/gene_sets').then(res => res.json())
        //TextGe
        console.log("gene results", geneResults)
        //const predefined =  OrderedMap<string, TextOption>([new TextOption("gene_results", "top_results", "top_results", "top_results")]) //OrderedMap(gene_sets.map(value => [value.key, value]))
        //const predefined_options = predefined.map((value, key) => value.genes.map(gene=>makeGeneOption(gene)))
        //setPredefinedSets(predefined)
        //setPredefinedGenes()
        //setPredefinedSets(gene_sets)
        //await setPredefinedGenes(predefined_options)
        //console.log("KEYS OF PREDEFINED",Array.from(predefined_options.keys()))
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
        }).map(ensembl_id=> genesById.get(ensembl_id)!.asTextOption)
        const unique_genes = _.unionWith(selectedGenes.concat(chosen as Array<TextOption>), _.isEqual)
        await setSelectedGenes(unique_genes)
    }

    // @ts-ignore
    return (

                <Step.Description>
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
                                <Select

                                        placeholder="Search gene symbols"
                                        multi
                                        options={selectedGenesOptions}
                                        name="select"
                                        values={selectedGenes}
                                        searchFn={onSearchGenes as any}
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

                </Step.Description>
    )

}

export default OrthologySelection