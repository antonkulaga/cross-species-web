const col_def =  [
    {headerName: 'maximum_longevity', field: 'maximum_longevity'}
    {headerName: 'bioproject', field: 'bioproject'},
    {headerName: 'series', field: 'series'},
    {headerName: 'run', field: 'run'},
    {headerName: 'organism', field: 'organism'},
    {headerName: 'taxid', field: 'taxid'},
    {headerName: 'sample_name', field: 'sample_name'},
    {headerName: 'library_strategy', field: 'library_strategy'},
    {headerName: 'library_layout', field: 'library_layout'},
    {headerName: 'library_selection', field: 'cDNA'},
    {headerName: 'study', field: 'study'},
    {headerName: 'study_title', field: 'study_title'},
    {headerName: 'characteristics', field: 'characteristics'},
    {headerName: 'source', field: 'source'},
    {headerName: 'age', field: 'age'},
    {headerName: 'genes', field: 'genes'},
    {headerName: 'sex', field: 'sex'},
    {headerName: 'transcripts', field: 'transcripts'},
    {headerName: 'quant', field: 'quant'},
    {headerName: 'protocol', field: 'protocol'}
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

function getData(values){
    console.log("values length", values.length);
    console.log("mammals table", mammals_lifespan.length);

    for(var i = 0; i < values.length; i++){
        for(var j = 0; j < mammals_lifespan.length; j++){
            if(mammals_lifespan[j].ncbi_taxid == values[i].taxid){
                values[i]['maximum_longevity'] = mammals_lifespan[j]["Maximum longevity (yrs)"];
                console.log("found maximum_longevity", mammals_lifespan[j]["Maximum longevity (yrs)"]);
                break;
            }

            // if(values[i]['maximum_longevity']] == null){
            //     values[i]['maximum_longevity']= "";
            // }


        }
    }
    return values;
}

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