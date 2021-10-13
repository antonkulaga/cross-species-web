import {useState, useEffect, useCallback, SetStateAction, Dispatch} from 'react'
import React from 'react'


import PropTypes from 'prop-types';
import '../app.css';

// import SamplesGrid from './SamplesGrid'
//import { AgGridReact, AgGridColumn, AgGridColumnProps, AgGridColumnGroupProps} from 'ag-grid-react';
import { AgGridReact} from 'ag-grid-react/lib/agGridReact';
import { GridApi} from "ag-grid-community";

//import { AgGridReactFire } from 'ag-grid-react/lib/next/agGridReactFire';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {Button, Icon, Table, Divider, Header, Segment} from "semantic-ui-react";
import {Sample} from "../../shared/models";
import { ColDef } from 'ag-grid-community';

/**
 * Definitions of AgGrid columns
 */
const samplesColumnDefs: Array<ColDef> = [
    {
        headerName: 'Sample',
        field: 'run',
        //value: [],
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: true,
        filterParams: {
            filterOptions: ['contains']
        }
        // width: 130
    },
    {
        headerName: 'Species',
        field: 'organism',
        filterParams: {
            filterOptions: ['contains']
        },
        minWidth: 200
    },
    {
        headerName: 'Common name',
        field: 'common_name',
        filterParams: {
            filterOptions: ['contains']
        },
        minWidth: 200
    },
    {
        headerName: 'Max lifespan',
        field: 'lifespan',
        filterParams: {
            filterOptions: ['contains']
        }
    },
    {
        headerName: 'Tissue',
        field: 'source',
        filterParams: {
            filterOptions: ['contains']
        },
        minWidth: 150
    },
    {
        headerName: 'Sex',
        field: 'sex',
        filterParams: {
            filterOptions: ['contains']
        }
    },
    {
        headerName: 'Sequencer',
        field: 'sequencer',
        filterParams: {
            filterOptions: ['contains']
        },
        minWidth: 200
    },
    {
        headerName: 'Mass (g)',
        field: 'mass_g',
        filterParams: {
            filterOptions: ['contains']
        }
    },
     {
       headerName: 'Metabolic rate',
       field: 'mass_gmetabolic_rate',
       filterParams: {
         filterOptions: ['contains']
       }
     },
    {
        headerName: 'Temp (°C)',
        field: 'temperature_celsius',
        filterParams: {
            filterOptions: ['contains']
        }
    },
    {
        headerName: 'Animal class',
        field: 'animal_class',
        filterParams: {
            filterOptions: ['contains']
        }
    },
    {
        headerName: 'Taxon',
        field: 'taxon',
        filterParams: {
            filterOptions: ['contains']
        }
    },
    {
        headerName: 'Ensembl URL',
        field: 'ensembl_url',
        filterParams: {
            filterOptions: ['contains']
        }
    }
];


const samplesGridOptions = {
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    suppressRowClickSelection: true,
    suppressAggFuncInHeader: true,
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true
    },
    debug: true,
    animateRows: true,
    floatingFilter: true,
    rowData: []
};

const selectedSamplesGridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true
    },
    rowSelection: 'multiple',
    animateRows: true,
    rowDragManaged: true,
    rowData:  []
};

const selectedSamplesColumnDefs: any =  samplesColumnDefs.map(value => {
    const newVal: any = Object.assign({}, value)
    newVal.filterParams = undefined
    newVal.checkboxSelection = false
    newVal.headerCheckboxSelection = false
    return newVal
})
selectedSamplesColumnDefs[0].rowDrag = true
selectedSamplesColumnDefs[0].minWidth = 300

type SamplesGridInput = {
    children?: JSX.Element | JSX.Element[];
    samples: Array<Sample>, //Array<any>,
    selectedSamples: Array<Sample>,//Array<any>,
    setSelectedSamples: Dispatch<SetStateAction<Array<Sample>>>,
    autoSizeAll: (value: any) => void
}

/**
 * View with the Samples Grid
 * @param samples
 * @param selectedSamples
 * @param setSelectedRows
 * @param autoSizeAll
 * @constructor
 */
export const SamplesGrid = (
    {
        samples,
        selectedSamples,
        setSelectedSamples,
        autoSizeAll
    }:SamplesGridInput ) => { //UGLY CALLBACK TO GIVE DATA UPSTREAM

    const [quickFilterValue, setQuickFilterValue] = useState('')
    const [samplesGridApi, setSamplesGridApi] = useState<GridApi>({} as any)
    const [selectedSamplesGridApi, setSelectedSamplesGridApi] =  useState<GridApi>({} as any)

    const onSamplesGridReady = async (params) => {
        await setSamplesGridApi(params.api)
        autoSizeAll(params.columnApi);
    }

    const onSelectedSamplesGridReady = async (params) => {
        await setSelectedSamplesGridApi(params.api)
        autoSizeAll(params.columnApi);
        params.api.setDomLayout('autoHeight')
    }

    const downloadClick = () => {
        samplesGridApi.exportDataAsCsv({fileName: "samples.csv"});
    };

    const downloadSelectedClick = () => {
        selectedSamplesGridApi.exportDataAsCsv(({
            fileName: "selected_samples.csv"
        }));
    };

    const onSelectionChanged = async () => {
        const rows = samplesGridApi.getSelectedRows()
        await setSelectedSamples(rows)
    }

    const quickFilterChange = (e) => {
        console.log('quickFilterChange', e.target.value)
        setQuickFilterValue(e.target.value || '')
        samplesGridApi.setQuickFilter(quickFilterValue)

        if (!e.target.value
            || (e.target.value && e.target.value <=0)
            || e.target.value === "" ) {
            console.log("reset quickFilter");
            samplesGridApi.setFilterModel(null);
            samplesGridApi.onFilterChanged();
        }
    }

    const onClearAllFilters = async () => {
        samplesGridApi.setRowData(samples)
        setQuickFilterValue('')
        samplesGridApi.setQuickFilter('');
        samplesGridApi.setFilterModel(null);
        samplesGridApi.onFilterChanged();
    }

    return(
        <div id="SamplesGrid" className="ui segment"  style={{ width: '100%' }}>
            <div className="gridHolder" style={{ height: 'calc(100% - 25px)', width: `calc(100% - 25px)` }}>
                <div
                    className="ag-theme-balham"
                    style={
                        {
                            // width: '600px',//TODO
                            height: '500px'
                        }}
                >
                    <AgGridReact
                        rowData={samples}
                        onGridReady={onSamplesGridReady}
                        columnDefs={samplesColumnDefs}
                        gridOptions={samplesGridOptions}
                        onSelectionChanged={onSelectionChanged}
                    />
                </div>
                <div style={{ marginBottom: '5px' }}>
                    <div className="ui input" style={{ width: '100%' }}>
                        {/* <i className="search icon"></i> */}
                        <input
                            onChange={quickFilterChange}
                            value={quickFilterValue}
                            type="text"
                            id="quickFilter"
                            placeholder="filter everything..."
                        />
                        {/* <div className="ui teal button">Search</div> */}
                        <Button
                            onClick={onClearAllFilters}
                            className="ui blue"
                        >
                            Clear all filters
                        </Button>
                        <Button icon
                                onClick={downloadClick}
                                className="ui blue"
                        >
                            <Icon name='download' />
                            Download all as CSV
                        </Button>
                    </div>
                </div>
            </div>
            <Divider horizontal>
                <Header as='h4'>
                    Selected samples (can be reordered):
                </Header>
            </Divider>
            <div className="gridHolder" style={{ height: 'calc(100% - 25px)', width: `calc(100% - 25px)` }}>
                <div
                    className="ag-theme-balham"
                >
                <AgGridReact
                    rowData={selectedSamples}
                    columnDefs={selectedSamplesColumnDefs}
                    gridOptions={selectedSamplesGridOptions}
                    onGridReady={onSelectedSamplesGridReady}
                />
                </div>
                <Button icon
                        disabled={selectedSamples.length === 0}
                        onClick={downloadSelectedClick}
                        className="ui blue"
                >
                    <Icon name='download' />
                    Download selected as CSV
                </Button>
            </div>
        </div>
    )


}