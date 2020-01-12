import React from 'react'

import './App.css';

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import SAMPLES_DATA from './data/samples_values.json'

const columnDefs = [
  {
      headerName: 'Sample',
      field: 'run', 
      checkboxSelection: true, 
      headerCheckboxSelectionFilteredOnly: true,
      headerCheckboxSelection: true,
      filterParams: {
          filterOptions:['contains']
      }
      // width: 130
  },
  {
      headerName: "Species",
      field: "organism", 
      filterParams: {
          filterOptions:['contains']
      }
  },
  // {headerName: 'Species latin', field: 'organism',  rowGroupIndex: 0},
  {
      headerName: 'Max lifespan',
      field: 'maximum_longevity',
      filterParams: {
          filterOptions:['contains']
      }
  },
  {
      headerName: 'Tissue',
      field: 'source',
      filterParams: {
          filterOptions:['contains']
      }
  },
  {
      headerName: 'Sex',
      field: 'sex',
      filterParams: {
          filterOptions:['contains']
      }
  },
  {
      headerName: 'Sequencer', 
      field: 'sequencer'
  }
];

export default class SamplesGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gridOptions: {
          defaultColDef: {
              sortable: true,
              filter: true
          },
          rowData: SAMPLES_DATA,
          columnDefs: columnDefs,
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
          // autoGroupColumnDef: {headerName: "Species", field: "organism", width: 200,
          //     cellRenderer:'agGroupCellRenderer',
          //     cellRendererParams: {
          //         checkbox: function(params) {
          //             return params.node.group === true;
          //         }
          //     }
          // },
          // onRowSelected: onRowSelected,
          // onSelectionChanged: onSelectionChanged,
      
          animateRows: true,
          floatingFilter:true
      },
      quickFilterValue: ''
    }
  }

  quickFilterChange(e) {
    console.log(e.target.value)
    this.setState({quickFilterValue: e.target.value || ''})
    this.api.setQuickFilter(this.state.quickFilterValue)
  }
  
  onGridReady = (params) => {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  render() {
    return (
      <div>
        <h3 className="ui header">Select samples</h3>
        <div style={{marginBottom: "5px"}}>
            <div className="ui input" style={{width: "100%"}}>
                {/* <i className="search icon"></i> */}
                <input 
                    onChange={this.quickFilterChange.bind(this)}
                    value={this.state.quickFilterValue}
                    type="text" 
                    id="quickFilter" 
                    placeholder="filter everything..."></input>
                {/* <div className="ui teal button">Search</div> */}
            </div>
            {/* <button onclick="filterLung()">Filter all species by lung</button> */}
            {/* <button onclick="filterRbieti()">Filter all tissues by species rbieti</button>
            <button onclick="clearFilter()" style="margin-left: 10px;">Clear Filter</button> */}
        </div>
        
        <div style={{height: "calc(100% - 25px)"}}>
          <div className="ag-theme-balham" style={ 
            {
              //width: '600px',//TODO
              height: '300px'
            } }>
            <AgGridReact
              onGridReady={this.onGridReady}
              gridOptions={this.state.gridOptions}>
            </AgGridReact>
          </div>
        </div>
      </div>
    );
  }
}
