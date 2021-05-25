import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {List, fromJS, OrderedMap, OrderedSet} from "immutable"
import {Button, Divider, Dropdown, Header, Icon, Image, Radio, Segment, Step, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {AgGridReact} from "ag-grid-react";

export const OrthologyTable = ({
                                   selectedRows,
                                   selectedSpecies,
                                   orthologyData, setOrthologyData,
                                   autoSizeAll,
                                   selectedGenes,
                                   setShowLoader,
                                   selectedOrganism
                               }
) => {

    const [orthologyRows, setOrthologyRows] = useState([])
    const [orthologyGridApi, setOrthologyGridApi] = useState(null)
    const [bySymbol, setBySymbol] = useState(false)
    const baseOrthologyColumnDefs = [
        {
            headerName: 'Selected gene',
            field: 'selected_gene',
            rowDrag: true,
            cellRenderer: function(params) {
                return '<a href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
            }
        }
    ];

    const orthologyGridOptions = {
        suppressRowClickSelection: true,
        suppressAggFuncInHeader: true,
        rowDragManaged: true,
        debug: true,
        // floatingFilter: true
    };

    const [orthologyColumnDefs, setOrthologyCoolumnDefs] = useState(baseOrthologyColumnDefs)

    const [showOrthology, setShowOrthology] = useState(false)
    //const [genesFromOrthology, setGenesFromOrthology] = useState([])
    //const [runsFromOrthology, setRunsFromOrthology] = useState([]) //TODO: check why its value is not used
    //const [, updateState] = React.useState();
    //const forceUpdate = React.useCallback(() => updateState({}), []);



    useEffect(()=>{
        setOrthologyCoolumnDefs(baseOrthologyColumnDefs.concat(
            selectedSpecies.filter(species => species.organism !== selectedOrganism).map(species => ({
                headerName: species.organism,
                field: species.organism,
                cellRenderer: function(params) {
                    return '<a href="https://www.ensembl.org/'+ species.organism +'/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
                }
            }))
        ))
    }, [selectedSpecies])


    const updateOrthologyRows = (existing_genes, table) =>
    {
        const rows = existing_genes.map(gene =>{
                const item = table.get(gene)
                return OrderedMap(orthologyData.species.map(sp=> {
                    if(item.has(sp))
                    {
                        const ortho = item.get(sp).toJS(); //getting ortholog genes for the species
                        return [sp, ortho.map(v=>v.ortholog).reduce((acc, ortholog)=> acc + ortholog + ";")]
                    }
                    else return [sp, "N/A"]
                })).set("selected_gene",gene).toJS()
            }
        )
        console.log("ORTHOLOGY ROWS:", rows)
        setOrthologyRows(rows)
    }

    useEffect(()=>{
        if(orthologyData !==null){
            setShowOrthology(true)
            const table = fromJS(orthologyData["orthology_table"]).toOrderedMap()
            const existing_genes = orthologyData["genes"].filter(gene=>table.has(gene))
            updateOrthologyRows(existing_genes, table)
        } else {
            setShowOrthology(false)
        }



    }, [orthologyData])



    const onOrthologyGridReady = (params) => {
        setOrthologyGridApi(params.api)
        // this.samplesColumnApi = params.columnApi;
        autoSizeAll(params.columnApi);
    }

    const get_orthology_table = async () => {
        console.log("selected organism is: ", selectedOrganism)
        const organisms = OrderedSet(fromJS(selectedRows.filter(sample=>sample.organism !== selectedOrganism).map(sample=>sample.organism)))
        const orthologyTypes = ["ens:ortholog_one2one", "ens:ortholog_one2many"] // ens:ortholog_many2many

        const body = JSON.stringify({
            reference_genes: selectedGenes.map(gene => gene.key),
            species: organisms,
            orthologyTypes: orthologyTypes
        })

        console.log("body to send", body)

        let orthologyResponse = await fetch('/api/orthology_table', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        });
        return  await orthologyResponse.json()
    }

    const loadOrthologyGenes = async () => {
        setShowLoader(true)
        const data = await get_orthology_table()
        await setOrthologyData(data)
        setShowLoader(false)
        console.log("Orthology data:", data)
    }

    const downloadClick = () => {
        orthologyGridApi.exportDataAsCsv({fileName: "genes.csv"});
    };

    const renderOrthoGrid = (value) => {
        if(value)
            return (

            <div id="OrthologyGrid" style={{ marginTop: '72px'}}>
            <h3 className="ui header">Orthology table</h3>
            <div
                className="ag-theme-material"
                style={{
                    height: '300px',
                }}
            >
                <Button icon color="blue" disabled={orthologyRows.length === 0} onClick={downloadClick}>
                    <i name="download"> </i>
                    Download genes
                </Button>
                <AgGridReact
                    onGridReady={onOrthologyGridReady}
                    rowData={orthologyRows}
                    columnDefs={orthologyColumnDefs}
                    gridOptions={orthologyGridOptions}
                /> </div>
            </div>);
        return false
    }

    const bySymbolSelection = () => {
        setBySymbol(!bySymbol)
    }


    return(

              <Segment>
                <Radio toggle selected={bySymbol} onChange={bySymbolSelection} label="by gene symbol" />
                <Button onClick={loadOrthologyGenes}
                        className="ui blue"
                        size="massive" disabled={selectedRows.length === 0}
                >
                    Load ortholog genes
                </Button>
                { renderOrthoGrid(showOrthology) }
              </Segment>
    )
}

export default OrthologyTable