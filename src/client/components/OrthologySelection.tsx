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
import {Gene, GeneResults, GeneSetOption, Sample, Species, TextOption} from "../../shared/models";
import {plainToClass} from "class-transformer";

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

    const [predefinedSets, setPredefinedSets] = useState(new Array<GeneSetOption>())
    const [predefinedSetsByName, setPredefinedSetsByName] = useState(OrderedMap<string, GeneSetOption>())

    const [selectedGeneSet, setSelectedGeneSet] = useState('')

    const [selectedIds, setSelectedIds] = useState(new Array<string>())

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);


    //TODO: FINISH MOVING TO Orthology Selection

    /**
     * get genes for the reference organism
     * @param organism
     */
    const getReferenceOrgGenes = async (organism: string): Promise<Array<Gene>> => {
        return await fetch(`/api/all_genes/${organism}`).then(res => res.json()).then(res=> plainToClass(Gene, res))
    }

    const onChangePredefinedGenes = async (e, target) => {
        const gene_set = target.value
        console.log(" setSelectedGeneSet", gene_set)
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
        console.log("search genes", searchTxt)
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

    const fetchGeneSets = async(): Promise<Array<GeneSetOption>> => {
        return  fetch('/api/gene_sets')
            .then(res => res.json())
            .then(res=> plainToClass(GeneSetOption, res))
    }

    /**
     * Loads predefined
     */
    const loadGeneSuggestions = async () =>{
        setShowLoader(true)
        forceUpdate();
        await applyReferenceOrganism('Homo_sapiens')
        console.log("LOADING PREDEFINED OPTIONS")
        const predefined_options : Array<GeneSetOption> = await fetchGeneSets()
        console.log("predefined_options ", predefined_options )
        const byName = OrderedMap(predefined_options.map(v=>[v.id, v]))
        await setPredefinedSets(predefined_options)
        await setPredefinedSetsByName( byName )
        setShowLoader(false)
    }

    useEffect( ()=>{
        loadGeneSuggestions().then(_ => console.log("gene suggestions loaded"))
    }, [])

    const addGenes = async (e) => {

        let chosen: Array<TextOption>;
        if (selectedGeneSet === "" || !predefinedSetsByName.has(selectedGeneSet)) {
            chosen = new Array<TextOption>();
        } else {
            const geneSet = predefinedSetsByName.get(selectedGeneSet)!
            console.log("selectedGeneSet", selectedGeneSet)
            console.log("geneSet", geneSet)
            console.log("geneSetOptions", geneSet.geneOptions)
            console.log("geneSetOptionsManuals", geneSet.genes.map(g=>g.asTextOption))
            chosen = geneSet.geneOptions;
        }

        /*
        const id_options: TextOption[] = selectedIds.length === 0 ? []: selectedIds.filter(id =>{
            const exist = genesById.has(id)
            if(!exist) console.warn("could not find gene ", id)
            return exist
        }).map(ensembl_id=> genesById.get(ensembl_id)!.asTextOption)
        */

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