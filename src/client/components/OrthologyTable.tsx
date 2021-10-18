import React, {useState, useEffect, useCallback, useReducer, Dispatch, SetStateAction} from 'react'
import {List, fromJS, OrderedMap, OrderedSet} from "immutable"
import {Button, Divider, Dropdown, Header, Icon, Image, Radio, Segment, Step, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {AgGridReact} from "ag-grid-react";
import {Gene, Orthology,  RequestContent, Sample, Species} from "../../shared/models";
import {ColDef, GridApi} from "ag-grid-community";
import {plainToClass} from "class-transformer";
import {OrthologyData} from "../../shared/tables";

type OrthologTableInputs = {
    children?: JSX.Element | JSX.Element[],
    selectedSamples: Array<Sample>
    selectedSpecies: Array<Species>
    selectedGenes: Array<Gene>
    setShowLoader: Dispatch<SetStateAction<boolean>>
    selectedOrganism: string
    orthologyData: OrthologyData, setOrthologyData: Dispatch<SetStateAction<OrthologyData>>
    autoSizeAll: (value: any) => void
}

export const OrthologyTable = ({
                                   selectedSamples,
                                   selectedSpecies,
                                   orthologyData, setOrthologyData,
                                   autoSizeAll,
                                   selectedGenes,
                                   setShowLoader,
                                   selectedOrganism
                               }: OrthologTableInputs
) => {

    const [orthologyRows, setOrthologyRows] = useState(new Array<Object>())
    const [orthologyGridApi, setOrthologyGridApi] = useState<GridApi>({} as any)
    const [bySymbol, setBySymbol] = useState(false)
    const baseOrthologyColumnDefs: Array<ColDef> = [
        {
            headerName: selectedOrganism.replace("_", " "),
            field: selectedOrganism,
            rowDrag: true,
            cellRenderer: function(params) {
                return '<a href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
            },
            minWidth: 300
        }
    ];

    const orthologyGridOptions = {
        suppressRowClickSelection: true,
        suppressAggFuncInHeader: true,
        rowDragManaged: true,
        debug: true,
        defaultColDef: {
            sortable: true,
            resizable: true
        }
        // floatingFilter: true
    };

    const [orthologyColumnDefs, setOrthologyCoolumnDefs] = useState<Array<ColDef>>(baseOrthologyColumnDefs)

    const [showOrthology, setShowOrthology] = useState(false)
    //const [genesFromOrthology, setGenesFromOrthology] = useState([])
    //const [runsFromOrthology, setRunsFromOrthology] = useState([]) //TODO: check why its value is not used
    //const [, updateState] = React.useState();
    //const forceUpdate = React.useCallback(() => updateState({}), []);



    useEffect(()=>{
        //TODO: improve types
        const renderedSpecies: Array<ColDef>=  selectedSpecies
            .filter(species => species.species !== selectedOrganism)
            .map(species => ({
                headerName: species.species,
                field: species.species,
                cellRenderer: function(params) {
                    return '<a href="https://www.ensembl.org/'+ species.species +'/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
                }
            }))
        setOrthologyCoolumnDefs(baseOrthologyColumnDefs.concat(renderedSpecies))
    }, [selectedSpecies])

    useEffect(() =>{
        if(orthologyData.isEmpty) {
            setOrthologyRows([])
            setShowOrthology(false)
        } else {
            const rows = orthologyData.makeRows(selectedOrganism)
            setShowOrthology(true)
            setOrthologyRows(rows)
            console.log("setOrthologyRows", rows)
        }
    },[orthologyData])

    const onOrthologyGridReady = (params) => {
        params.api.setDomLayout('autoHeight')
        setOrthologyGridApi(params.api)
        autoSizeAll(params.columnApi);
    }

    /**
     * Fetches orthology information
     * @param reference_genes reference genes ids
     * @param species species ids
     * @param orthologyTypes types of orthologies
     */
    const fetch_orthology = async (orthologyTypes: Array<string>) => {
        const toSend = new OrthologyData(
            selectedGenes,selectedSamples.filter(sample=>sample.organism !== selectedOrganism).map(sample=>sample.organism),
            orthologyTypes)
        const content2send = new RequestContent(toSend)
        //console.log("content to send is", content2send)
        return  fetch('/api/orthology', content2send)
            .then(res => res.json())
            .then(res=> plainToClass(Orthology, res))
    }



    const fetch_orthology_table = async (
        orthologyTypes: Array<string> = ["ens:ortholog_one2one", "ens:ortholog_one2many"]/* ens:ortholog_many2many */): Promise<OrthologyData> => {
        console.log("selected organism is: ", selectedOrganism)
        const organisms = selectedSamples.filter(sample=>sample.organism !== selectedOrganism).map(sample=>sample.organism)
        const orthos =  await fetch_orthology(orthologyTypes)
        return new OrthologyData(selectedGenes, organisms, orthologyTypes, orthos)
    }

    const loadOrthologyGenes = async () => {
        setShowLoader(true)
        if(selectedGenes.length === 0 || selectedSpecies.length === 0){
            setOrthologyData(OrthologyData.empty)
        } else {
            const data = await fetch_orthology_table()
            console.log("Received orthology data, rows are:", data.makeRows(selectedOrganism))
            await setOrthologyData(data)
            setShowLoader(false)
            //console.log("Orthology data:", data.orthology_table.toJSON())
        }
    }

    const downloadClick = () => {
        orthologyGridApi.exportDataAsCsv({fileName: "genes.csv"});
    };

    const renderOrthoGrid = (value) => {
        if(value)
            return (
            <div id="OrthologyGrid" style={{ marginTop: '72px'}}>
            <h3 className="ui header">Orthology table (can be reordered)</h3>
                <div className="gridHolder" style={{ height: 'calc(100% - 25px)', width: `calc(100% - 25px)` }}>
                    <div
                        className="ag-theme-balham"
                    >
                    <AgGridReact
                        onGridReady={onOrthologyGridReady}
                        rowData={orthologyRows}
                        columnDefs={orthologyColumnDefs}
                        gridOptions={orthologyGridOptions}
                    />
                    </div>
                </div>
                <Button icon color="blue" disabled={orthologyRows.length === 0} onClick={downloadClick}>
                    <i className="download" id="download"> </i>
                    Download genes
                </Button>

            </div>);
        return false
    }

    return(

              <Segment>
                <Button onClick={loadOrthologyGenes}
                        className="ui blue"
                        size="massive" disabled={selectedSamples.length === 0}
                >
                    Load ortholog genes
                </Button>
                { renderOrthoGrid(showOrthology) }
              </Segment>
    )
}

export default OrthologyTable

//<Radio toggle selected={bySymbol} onChange={bySymbolSelection} label="by gene symbol" />
