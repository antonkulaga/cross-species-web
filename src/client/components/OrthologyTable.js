import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {Button, Divider, Dropdown, Header, Icon, Image, List, Step, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {AgGridReact} from "ag-grid-react";

export const OrthologyTable = ({
                                   selectedRows,
                                   orthologyData, setOrthologyData,
                                   autoSizeAll,
                                   setGenesMap, selectedGenes,
                                   setGenesMapBySpecies,
                                   ENSEMBL_TO_NAME, setENSEMBL_TO_NAME //TODO: check if it makes sence
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


    const [orthologyColumnDefs, setOrthologyColumnDefs] = useState([{
        headerName: 'Selected gene',
        field: 'selected_gene'
    }])

    const [showOrthology, setShowOrthology] = useState(false)
    const [genesFromOrthology, setGenesFromOrthology] = useState([])
    const [runsFromOrthology, setRunsFromOrthology] = useState([]) //TODO: check why its value is not used
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);



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

    const onOrthologyGridReady = (params) => {
        // this.samplesGridApi = params.api;
        // this.samplesColumnApi = params.columnApi;
        autoSizeAll(params.columnApi);
    }


    const getOrthology = async () => {

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
    }

    const onClickShowGenes= async  () => {
        const orthologyResponse = await getOrthology();
        console.log("orthologyResponse", orthologyResponse);

        let genes = [];
        let runs = [];
        for(let key in orthologyResponse) {
            let array = orthologyResponse[key];

            for(let i = 0; i < array.length; i++){
                genes.push(array[i].ortholog_id);
                runs.push(array[i].ortholog_species);
                ENSEMBL_TO_NAME[array[i].ortholog_id] = array[i].ortholog_symbol;
            }
        }
        setENSEMBL_TO_NAME(ENSEMBL_TO_NAME) //added the update

        //TODO: get side effects out
        setGenesFromOrthology(genes)
        setRunsFromOrthology(runs)
        console.log("genesFromOrthology", genes);
        console.log("runsFromOrthology", runs);

        let genesMap = [];
        let genesMapBySpecies = [];
        setOrthologyData(Object.keys(orthologyResponse).map((geneId) => {
            const row = {};
            row.selected_gene = geneId;
            orthologyResponse[geneId].forEach((ortholog) => {
                if (!row[ortholog.ortholog_species]) {
                    row[ortholog.ortholog_species] = ortholog.ortholog_id;
                    genesMap[geneId] = ortholog.ortholog_id;
                    genesMapBySpecies[geneId + ortholog.ortholog_species] = ortholog.ortholog_id;
                }
                else {
                    row[ortholog.ortholog_species] += `, ${ortholog.ortholog_id}`;
                    genesMap[geneId] +=`,${ortholog.ortholog_id}`;
                    genesMapBySpecies[geneId + ortholog.ortholog_species] += `,${ortholog.ortholog_id}`
                }
            });
            return row;
        }));

        //TODO: get side-effects out
        setGenesMap(genesMap)
        setGenesMapBySpecies(genesMapBySpecies)
        await setShowOrthology(true)

        forceUpdate();
        /*

                let runs = [];
                let genes = genesFromOrthology

                for(let i = 0; i < selectedRows.length; i++){
                    runs.push(selectedRows[i].run);
                }
                await getGeneExpression(runs, genes);

         */
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
                <Button onClick={onClickShowGenes}
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