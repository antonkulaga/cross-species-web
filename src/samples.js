// const col_def =  [
//     {headerName: 'maximum_longevity', field: 'maximum_longevity'},
//     {headerName: 'bioproject', field: 'bioproject'},
//     {headerName: 'series', field: 'series'},
//     {headerName: 'run', field: 'run'},
//     {headerName: 'organism', field: 'organism'},
//     {headerName: 'taxid', field: 'taxid'},
//     {headerName: 'sample_name', field: 'sample_name'},
//     {headerName: 'library_strategy', field: 'library_strategy'},
//     {headerName: 'library_layout', field: 'library_layout'},
//     {headerName: 'library_selection', field: 'cDNA'},
//     {headerName: 'study', field: 'study'},
//     {headerName: 'study_title', field: 'study_title'},
//     {headerName: 'characteristics', field: 'characteristics'},
//     {headerName: 'source', field: 'source'},
//     {headerName: 'age', field: 'age'},
//     {headerName: 'genes', field: 'genes'},
//     {headerName: 'sex', field: 'sex'},
//     {headerName: 'transcripts', field: 'transcripts'},
//     {headerName: 'quant', field: 'quant'},
//     {headerName: 'protocol', field: 'protocol'}
// ]

const col_def =  [
    {
        headerName: 'Sample', 
        field: 'run', 
        checkboxSelection: true, 
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: true,
        // width: 130
    },
    {headerName: "Species", field: "organism"},
    // {headerName: 'Species latin', field: 'organism',  rowGroupIndex: 0},
    {headerName: 'Max lifespan', field: 'maximum_longevity'},
    {headerName: 'Tissue', field: 'source'},
    {headerName: 'Sex', field: 'sex'},
    {headerName: 'Sequencer', field: 'sequencer'}
]

// const row_data =  [
//     {sample: "SRS614720", tissue: "lung", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
//     {sample: "SRR1300763", tissue: "kidney", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
//     {sample: "SRR1300767", tissue: "heart", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
//     {sample: "SRR1300765", tissue: "liver", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
//     {sample: "SRR1300766", tissue: "brain", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
//     {sample: "SRS614720", tissue: "lung", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
//     {sample: "SRR1300763", tissue: "kidney", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
//     {sample: "SRR1300767", tissue: "heart", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
//     {sample: "SRR1300765", tissue: "liver", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
//     {sample: "SRR1300766", tissue: "brain", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"}
// ]
const gridOptions = {
    defaultColDef: {
        sortable: true
    },
    rowData: values,
    columnDefs: col_def,
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

    animateRows: true
};
function onQuickFilterChanged() {
    gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
}


// function onRowSelected(event) {
//     console.log("row " + event.node.data.athlete + " selected = " + event.node.selected);
// }

// function onSelectionChanged(event) {
//     var rowCount = event.api.getSelectedNodes().length;
//     console.log('selection changed, ' + rowCount + ' rows selected');
// }



// function filterLung() {
//   gridOptions.api.setFilterModel({tissue: ['lung']});
// }


// function filterRbieti() {
//   gridOptions.api.setFilterModel({species: ['Rhinopithecus bieti']});
// }

// function clearFilter() {
//     gridOptions.api.setFilterModel(null);
// }

$(document).ready(function(){
    const gridDiv = document.querySelector('#samples');
    const grid = new agGrid.Grid(gridDiv, gridOptions);
});