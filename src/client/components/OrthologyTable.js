import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {Divider, Dropdown, Header, Icon, Image, List, Step, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {AgGridReact} from "ag-grid-react";

export const OrthologyTable = (showOrthology, orthologyData) => {

    const orthologyColumnDefs =  [{
            headerName: 'Selected gene',
            field: 'selected_gene'
        }]

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

    const autoSizeAll = (columnApi, skipHeader = false) => {
        const allColumnIds = [];
        columnApi.getAllColumns().forEach((column) => {
            allColumnIds.push(column.colId); //TODO: clarify with Laurence+Alex why they do this
        });
        columnApi.autoSizeColumns(allColumnIds, skipHeader);
    }

    const onOrthologyGridReady = (params) => {
        // this.samplesGridApi = params.api;
        // this.samplesColumnApi = params.columnApi;
        autoSizeAll(params.columnApi);
    }

    return(
        <div>
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
                    />
                </div>
            </div>
        </div>
    )
}

export default OrthologyTable