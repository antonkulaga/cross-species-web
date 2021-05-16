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
                               }
) => {

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
            selectedSpecies.map(species => ({
                headerName: species.organism,
                field: species.organism,
                cellRenderer: function(params) {
                    return '<a href="https://www.ensembl.org/'+ species.organism +'/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
                }
            }))
        ))
    }, [selectedSpecies])



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

/*
    const speciesRows = orthologyData.map(gene =>



        <Table.Row key={species.organism}>
            <Table.Cell>
                <Image
                    src={`http://www.ensembl.org/i/species/${species.organism.replace(" ", "_")}.png`}
                    as='a'
                    size='tiny'
                    href={species.ensembl_url}
                    target='_blank'
                    circular
                />
            </Table.Cell>
            <Table.Cell>{gene.ortholog_common_name}</Table.Cell>
            <Table.Cell>{species.common_name}</Table.Cell>
            <Table.Cell>{species.taxon}</Table.Cell>
            <Table.Cell>{round(species.lifespan)}</Table.Cell>
            <Table.Cell>{!isNaN(species.mass_g)? round(species.mass_g / 1000.0) : "N/A"}</Table.Cell>
            <Table.Cell>{round(species.metabolic_rate)}</Table.Cell>
            <Table.Cell>{round(species.temperature_celsius)}</Table.Cell>

        </Table.Row>
    )
 */


    const getOrthology = async () => {
        const organisms = OrderedSet(fromJS(selectedRows.map(sample=>sample.organism)))
        const orthologyTypes = ["ens:ortholog_one2one", "ens:ortholog_one2many"] // ens:ortholog_many2many

        const body = JSON.stringify({
            reference_genes: selectedGenes.map(gene => gene.key),
            species: organisms,
            orthologyTypes: orthologyTypes
        })

        console.log("body to send", body)

        let orthologyResponse = await fetch('/api/getOrthology', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        });
        console.log("orthologyReponse", orthologyResponse)
        return  await orthologyResponse.json()

        /*


        console.log("organisms from samples", organisms)

        const speciesToSRR = {};
        console.log("GET ORTHOLOGY!")
        console.log(selectedRows)
        selectedRows.forEach((sample) => {
            console.log("SAMPLE")
            console.log(sample)
            if(!speciesToSRR[sample.organism])
                speciesToSRR[sample.organism] = [];
            else
                speciesToSRR[sample.organism].push(sample.run);
        });
        const selectedSpecies = Object.keys(speciesToSRR);

        await setOrthologyColumnDefs(baseOrthologyColumnDefs.concat(
            selectedSpecies.map(species => ({
                headerName: species,
                field: species,
                cellRenderer: function(params) {
                    return '<a href="https://www.ensembl.org/'+ species +'/Gene/Summary?db=core;g=' + params.value+ '">'+ params.value+'</a>'
                }
            }))
        ))

        let orthologyResponse = await fetch('/api/getOrthologyOne2Many', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                genes: selectedGenes.map(gene => gene.ensembl_id),
                samples: selectedRows
            })
        });
        return await orthologyResponse.json();
         */
    }

    const loadOrthologyGenes = () => {
        const data = getOrthology()
        console.log("Orthology data:", data)
    }

    const renderOrthoGrid = (value) => {
        if(value)
            return (
            <div id="OrthologyGrid" style={{ marginTop: '72px' }}>
            <h3 className="ui header">Orthology table</h3>
            <div
                className="ag-theme-material"
                style={{
                    height: '300px',
                }}
            >
                <AgGridReact
                    onGridReady={onOrthologyGridReady}
                    rowData={orthologyData}
                    columnDefs={orthologyColumnDefs}
                    gridOptions={orthologyGridOptions}
                /> </div>
            </div>);
        return false
    }


    return(
        <Step disabled={selectedRows.length === 0} >
            <Icon name='dna' />
            <Step.Content>
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