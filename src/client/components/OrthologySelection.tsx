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
import Select, {SelectRenderer} from "react-dropdown-select";
import _ from "lodash";
import {OrderedMap, OrderedSet, fromJS} from "immutable";
import {Gene, GeneResults, GeneSet, Sample, Species, TextOption} from "../../shared/models";
import {plainToClass} from "class-transformer";

//import GENAGE_GENES_PRO from './data/genage_genes_pro.json'
//import GENAGE_GENES_ANTI from './data/genage_genes_anti.json'

//import ENSEMBL_TO_NAME from './data/ensemblToName.json'

type OrthologySelectionInput = {
    children?: JSX.Element | JSX.Element[],
    selectedGenes: Array<Gene>, setSelectedGenes: Dispatch<SetStateAction<Array<Gene>>>,
    species: OrderedMap<string, Species>,
    setShowLoader: Dispatch<SetStateAction<boolean>>,
    referenceGenes: Array<Gene>, setReferenceGenes: Dispatch<SetStateAction<Array<Gene>>>
    selectedOrganism: Species, setSelectedOrganism: Dispatch<Species>
}

export const OrthologySelection = (
    {
        species,
        selectedGenes, setSelectedGenes,
        setShowLoader,
        referenceGenes,setReferenceGenes,
        selectedOrganism, setSelectedOrganism
    }: OrthologySelectionInput
    ) => {

    const LIMIT = 50
    const [lastSearchGenes, setLastSearchGenes] = useState('default')

    const [geneSuggestions, setGeneSuggestions] = useState(new Array<Gene>())

    const [predefinedGeneSets, setPredefinedGeneSets] = useState(new Array<GeneSet>())

    const [selectedGeneSets, setSelectedGeneSets] = useState(new Array<GeneSet>())

    const [organismList, setOrganismList] =useState<Array<TextOption>>(new Array<TextOption>())

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);


    //TODO: FINISH MOVING TO Orthology Selection

    /**
     * get genes for the reference organism
     * @param organism
     */
    const fetchReferenceOrgGenes = async (organism: string): Promise<Array<Gene>> => {
        return await fetch(`/api/all_genes/${organism}`).then(res => res.json()).then(res=> plainToClass(Gene, res))
    }

    const onChangeGeneSets = async (values: Array<GeneSet>) => {
        if(values !== selectedGeneSets){
            const to_delete = _.difference(selectedGeneSets, values).flatMap(s=>s.genes)
            const to_add = _.difference(values, selectedGeneSets).flatMap(s=>s.genes)

            const updated_genes = _.unionWith(selectedGenes.filter(g=>to_delete.includes(g)).concat(to_add), _.isEqual)
            setSelectedGeneSets(values)
            setSelectedGenes(updated_genes)
        }
    }

    const onChangeGenes = async (values: Array<Gene>) => {
        if(values!==selectedGenes){
            console.log('onChangeGenes', values);
            await setSelectedGenes(values)
            //console.log("selected genes by names = ", selectedGenes)
            setGeneSuggestions(new Array<Gene>())
            //setSelectedGenesOptions([])
        } else {
            console.log('onChangeGenes', "NO CHANGES", values);
        }
    }

    //{ props, state, methods }: SelectRenderer<T>) => T[]
    const onSearchGenes = ({props, state, methods}: SelectRenderer<Gene>): Array<Gene> => {

        const searchTxt = (state.search).toUpperCase();
        //let searchTxt = search.toUpperCase(); //TODO fix
        if (searchTxt.length > 1 && lastSearchGenes !== searchTxt) {
            setLastSearchGenes(searchTxt)
            const genesToSuggest = referenceGenes
                .filter(gene=> gene.symbol.toUpperCase().includes(searchTxt) || gene.ensembl_short.includes(searchTxt))
                .slice(0, LIMIT)
            console.log("found genes", genesToSuggest)
            //setGeneSuggestions(genesToSuggest)
            return genesToSuggest
        } else return new Array<Gene>()
    }

    /**
     * Applis reference organisms and selects all of its genes
     * @param organism
     * @returns {Promise<void>}
     */
    const applyReferenceOrganism = async (organism) => {
        setShowLoader(true)
        console.log("apply reference organism")
        const sp = species.find(organism)
        if(sp === undefined && organism !== Species.human.species){
            console.error("Cannot find organism ", organism)
            return
        } else if(organism === Species.human.species) {
            setSelectedOrganism(Species.human)
        } else {
            setSelectedOrganism(sp!)
        }
        const genes: Array<Gene> = await fetchReferenceOrgGenes(organism)
        setReferenceGenes(genes)
        setShowLoader(false)
    }

    const onChangeOrganism = async (e, target) => {
        if(selectedOrganism.species !== target.value)
        {
            console.log("change or reference organism from:", selectedOrganism, " to ", target.value);
            await applyReferenceOrganism(target.value)
        }
    }

    const fetchGeneSets = async(): Promise<Array<GeneSet>> => {
        return  fetch('/api/gene_sets')
            .then(res => res.json())
            .then(res => plainToClass(GeneSet, res))
    }

    /**
     * Loads predefined
     */
    const loadGeneSuggestions = async () =>{
        setShowLoader(true)
        forceUpdate();
        await applyReferenceOrganism('Homo_sapiens')
        const predefined_options : Array<GeneSet> = await fetchGeneSets()
        console.log("predefined gene Set options ", predefined_options )
        await setPredefinedGeneSets(predefined_options)
        setShowLoader(false)
    }

    /**
     * Update organism names from species
     */
    useEffect(() => {
        const speciesNames = species.valueSeq().map( species => TextOption.fromSpecies(species) )
        setOrganismList(speciesNames.toArray())
    }, [species])

    useEffect( ()=>{
        loadGeneSuggestions().then(_ => console.log("gene suggestions loaded"))
    }, [])

    const addGenes = async (e) => {

    }


    return (

                <Step.Description>

                                <Header>
                                    Choose reference species
                                </Header>
                                <Dropdown
                                    placeholder="Reference species"
                                    fluid
                                    search
                                    selection
                                    options={organismList}
                                    value={selectedOrganism.species}
                                    key={selectedOrganism.common_name}
                                    onChange={onChangeOrganism}
                                />
                                The reference organism (Human by default) is used as a reference point to select your genes of interest.
                            <Divider horizontal>
                                <Header as='h4'>
                                    Select genes in the chosen references organism:
                                </Header>
                            </Divider>
                            <Header>You can select lists from predefined sets:</Header>
                            <Select
                                closeOnSelect={true}
                                placeholder="Select predefined list of genes"
                                multi
                                clearable={true}
                                options={predefinedGeneSets}
                                labelField="text"
                                valueField="set_name"
                                key={"gene_sets"}
                                values={selectedGeneSets}
                                onChange={onChangeGeneSets}
                            />

                                        And/OR you can search genes by their names or Ensembl ids
                                        <Select
                                            placeholder="Search gene symbols"
                                            multi
                                            clearable={true}
                                            options={geneSuggestions}
                                            labelField="text"
                                            valueField="ensembl_id"
                                            values={selectedGenes}
                                            searchBy={"text"}
                                            searchable={true}
                                            searchFn={onSearchGenes}
                                            onChange={onChangeGenes}
                                            closeOnSelect={true}
                                        />


                </Step.Description>
    )

}

export default OrthologySelection