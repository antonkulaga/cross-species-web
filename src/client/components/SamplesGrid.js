import { useState, useEffect, useCallback } from 'react'
import React from 'react'

import PropTypes from 'prop-types';
import '../app.css';

// import SamplesGrid from './SamplesGrid'
import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {Button, Table, Divider, Header} from "semantic-ui-react";

const samplesColumnDefs = [
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
    // {
    //   headerName: 'Metabolic rate',
    //   field: 'mass_gmetabolic_rate',
    //   filterParams: {
    //     filterOptions: ['contains']
    //   }
    // },
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
    floatingFilter: true
};

export const SamplesGrid = ({samplesRowData, setSelectedRows, autoSizeAll}) => { //UGLY CALLBACK TO GIVE DATA UPSTREAM

    const [quickFilterValue, setQuickFilterValue] = useState('')
    const [samplesGridApi, setSamplesGridApi] = useState({})

    const onSamplesGridReady = async (params) => {
        await setSamplesGridApi(params.api)
        autoSizeAll(params.columnApi);
    }


    const onSelectionChanged = async () => {
        const rows = samplesGridApi.getSelectedRows()
        //console.log("onSelectionChange", rows)
        await setSelectedRows(rows)
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
        samplesGridApi.setRowData(samplesRowData)
        setQuickFilterValue('')
        samplesGridApi.setQuickFilter('');
        samplesGridApi.setFilterModel(null);
        samplesGridApi.onFilterChanged();
    }

    return(
        <div id="SamplesGrid" className="ui segment"  style={{ width: '100%' }}>
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
                </div>
                {/* <button onclick="filterLung()">Filter all species by lung</button> */}
                {/* <button onclick="filterRbieti()">Filter all tissues by species rbieti</button>

                this.state.selectedRows.length === 0

                <button onclick="clearFilter()" style="margin-left: 10px;">Clear Filter</button> */}
            </div>
            <div id="gridHolder" style={{ height: 'calc(100% - 25px)', width: `calc(100% - 25px)` }}>
                <div
                    className="ag-theme-balham"
                    style={
                        {
                            // width: '600px',//TODO
                            height: '500px'
                        }}
                >
                    <AgGridReact
                        onGridReady={onSamplesGridReady}
                        rowData={samplesRowData}
                        columnDefs={samplesColumnDefs}
                        gridOptions={samplesGridOptions}
                        onSelectionChanged={onSelectionChanged}
                    />
                </div>
            </div>
        </div>
    )


}