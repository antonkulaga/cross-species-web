import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {List, fromJS, OrderedMap, OrderedSet} from "immutable"
import {Button, Divider, Dropdown, Header, Icon, Image, Step, Tab, Table} from 'semantic-ui-react'
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
    const baseOrthologyColumnDefs = [
        {
            headerName: 'Selected gene',
            field: 'selected_gene',
            cellRenderer: function(params) {
                return '<a href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
            }
        }
    ];

    const orthologyGridOptions = {
        suppressRowClickSelection: true,
        suppressAggFuncInHeader: true,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true
        },
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

    useEffect(()=>{
        if(orthologyData !==null){
            setShowOrthology(true)
            const table = fromJS(orthologyData["orthology_table"]).toOrderedMap()
            const existing_genes = orthologyData["genes"].filter(gene=>table.has(gene))
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
        } else {
            setShowOrthology(false)
        }



    }, [orthologyData])



    const onOrthologyGridReady = (params) => {
        // this.samplesGridApi = params.api;
        // this.samplesColumnApi = params.columnApi;
        autoSizeAll(params.columnApi);
    }


    /*
    ortholog_common_name: "Desert tortoise"
    ortholog_id: "ENSGAGG00000024348"
    ortholog_species: "Gopherus_agassizii"
    ortholog_symbol: "TRERF1"
    orthology: "ortholog_one2one"
     */

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
                <AgGridReact
                    onGridReady={onOrthologyGridReady}
                    rowData={orthologyRows}
                    columnDefs={orthologyColumnDefs}
                    gridOptions={orthologyGridOptions}
                /> </div>
            </div>);
        return false
    }


    return(
        <Step disabled={selectedRows.length === 0}  style={{ marginTop: '72px', width: `calc(100% - 25px)`  }} >
            <Icon name='dna' />
            <Step.Content  style={{ marginTop: '72px', width: `calc(100% - 25px)`  }}>
                <Step.Title><Header>Load ortholog genes</Header></Step.Title>
                <Button onClick={loadOrthologyGenes}
                        className="ui blue"
                        size="massive">
                    Get ortholog genes
                </Button>
                { renderOrthoGrid(showOrthology) }
            </Step.Content>
        </Step>
    )
}

export default OrthologyTable