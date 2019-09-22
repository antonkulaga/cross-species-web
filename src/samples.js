const col_def =  [
    {
    headerName: 'Sample', 
    field: 'sample', 
    checkboxSelection: true, 
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: true
    },
    {headerName: 'Tissue', field: 'tissue', rowGroupIndex: 1},
    {headerName: 'Maximum lifespan', field: 'lifespan'},
    {headerName: 'Common name', field: 'common'},
    {headerName: 'Age', field: 'age'},
    {headerName: 'Sex', field: 'sex'},
    {headerName: 'Species latin', field: 'species',  rowGroupIndex: 0},
    {headerName: 'Sequencer', field: 'sequencer'},
    {headerName: 'Description', field: 'description'}
]
const row_data =  [
    {sample: "SRS614720", tissue: "lung", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
    {sample: "SRR1300763", tissue: "kidney", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
    {sample: "SRR1300767", tissue: "heart", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
    {sample: "SRR1300765", tissue: "liver", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},
    {sample: "SRR1300766", tissue: "brain", species: "Rhinopithecus bieti", common: "Black snub-nosed monkey", sequencer: "Illumina HiSeq 2000", age: "32", sex: "male"},

    {sample: "SRS614720", tissue: "lung", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
    {sample: "SRR1300763", tissue: "kidney", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
    {sample: "SRR1300767", tissue: "heart", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
    {sample: "SRR1300765", tissue: "liver", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"},
    {sample: "SRR1300766", tissue: "brain", species: "Cercocebus atys", common: "Cercocebus atys", sequencer: "Illumina HiSeq 2000", age: "N/A", sex: "male", lifespan: "27"}
]


const gridOptions = {
    defaultColDef: {
    sortable: true
    },
    columnDefs: col_def,
    rowData: row_data,

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
    autoGroupColumnDef: {headerName: "Species", field: "species", width: 200,
        cellRenderer:'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: function(params) {
                return params.node.group === true;
            }
        }
    },
    // onRowSelected: onRowSelected,
    // onSelectionChanged: onSelectionChanged,

    animateRows: true
};

$(document).ready(function(){
    // function onRowSelected(event) {
    //     console.log("row " + event.node.data.athlete + " selected = " + event.node.selected);
    // }

    // function onSelectionChanged(event) {
    //     var rowCount = event.api.getSelectedNodes().length;
    //     console.log('selection changed, ' + rowCount + ' rows selected');
    // }

    function onQuickFilterChanged() {
        gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
    }

    // function filterLung() {
    //   gridOptions.api.setFilterModel({tissue: ['lung']});
    // }


    // function filterRbieti() {
    //   gridOptions.api.setFilterModel({species: ['Rhinopithecus bieti']});
    // }

    // function clearFilter() {
    //     gridOptions.api.setFilterModel(null);
    // }


    const gridDiv = document.querySelector('#samples');
    const grid = new agGrid.Grid(gridDiv, gridOptions);
});