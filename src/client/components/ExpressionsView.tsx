import React, {useState, useEffect, useCallback, useReducer, useRef, Dispatch, SetStateAction} from 'react'
import {Button, Divider, Dropdown, Header, Icon, Image,  Segment, Step, Tab, Table} from 'semantic-ui-react'
import {AgGridReact} from "ag-grid-react";
import Plotly from "react-plotly.js";
import {List, Map, OrderedMap} from "immutable";
import {Expressions, Gene, Orthology, RequestContent, Sample, TextOption} from "../../shared/models";
import {GridApi} from "ag-grid-community";
import {plainToClass} from "class-transformer";
import {ExpressionsTable, OrthologyData, ExpressionRow} from "../../shared/tables";
import HeatmapView from "./HeatmapView";

type ExpressioinsViewInput = {
    children?: JSX.Element | JSX.Element[],
    selectedSamples: Array<Sample>,
    orthologyData: OrthologyData
    setShowLoader: Dispatch<SetStateAction<boolean>>,
    autoSizeAll: (value: any) => void
}

//const expressionsByGeneByRun = OrderedMap(expressions.map(exp => [referenceByOrthologRef.current.get(exp.gene)+","+exp.run, round(exp.tpm)]))
/*
expressionsByGeneByRunRef.current = OrderedMap(expressions.map(exp => [referenceByOrthologRef.current.get(exp.gene)+","+exp.run, round(exp.tpm)]))
console.log("expression by gene by run",   expressionsByGeneByRunRef.current .toJS())


console.log("====================== PREPARIGN DATA FOR HEATMAP UPDATE, expressions are: ", expressions)

const expressionsByGeneByRun = expressionsByGeneByRunRef.current
console.log("RUNS ARE:", runs)
const matrix = orthologyData.reference_genes.map(y=> runs.map(x=>  expressionsByGeneByRun.get(y+","+x)))
const rows = orthologyData.reference_genes.map(y => {
    const result: Record<string,any> = {"selected_gene": y}
    runs.forEach(run=>result[run] = expressionsByGeneByRun.get(y+","+run))
    return result             //TODO: fix this ugly workaround
    }
)
/**
 * View of Gene Expressions
 * @param orthologyData
 * @param selectedSamples
 * @param setShowLoader
 * @param autoSizeAll
 * @constructor
 */
export const ExpressionsView = ({orthologyData, selectedSamples, setShowLoader, autoSizeAll}: ExpressioinsViewInput) => {

    //const round = (num) => isNaN(num) ? null: Math.round((num + Number.EPSILON) * 100) / 100

    const expressionsGridOptions = {
        suppressRowClickSelection: true,
        suppressAggFuncInHeader: true,
        rowDragManaged: true,
        debug: true,
        // floatingFilter: true
    };


    //const [runs, setRuns] = useState<Array<string>>([])

    const [expressionRows, setExpressionRows] = useState<Array<ExpressionRow>>([])

   // const heatmapRef = React.createRef();

    //const referenceByOrthologRef = useRef(Map())
    //const expressionsByGeneByRunRef = useRef(OrderedMap())


    const baseOrthologyColumnDefs = [
        {
            headerName: 'Samples/Genes',
            field: 'selected_gene'
        }
    ];

    const [expressionsColumnDefs, setExpressionsColumnDefs] = useState(baseOrthologyColumnDefs)
    //const [genesForSearch, setGenesForSearch] = useState<List<Gene>>(List()) //TODO: change name
    const [expressions, setExpressions] = useState<Array<Expressions>>([])
    const [expressionsTable, setExpressionsTable] = useState<ExpressionsTable>(ExpressionsTable.empty())

    const [expressionsGridApi, setExpressionsGridApi] = useState<GridApi>({} as any)

    const renderHeatMap = () => canRender() ?  (
        <HeatmapView expressionsTable={expressionsTable} expressionRows={expressionRows}>

        </HeatmapView>
    )
         : false

    /**
     * Gets gene expressions
     * @param runs
     * @param genes
     */
    const fetchExpressions = async  (runs: Array<string>, genes: Array<Gene>): Promise<Array<Expressions>> => {
        const toSend = {
            runs, genes
        }
        const content = new RequestContent(toSend)
        let response = await fetch('/api/expressions', content);
        return await response.json().then(res=> plainToClass(Expressions, res))
    }

    const onExpressionsGridReady = (params) => {
        params.api.setDomLayout('autoHeight')
        autoSizeAll(params.columnApi);
        setExpressionsGridApi(params.api)
    }

    const canRender = (): boolean => orthologyData.reference_genes.length > 0 && selectedSamples.length > 0

    /**
     * Effects
     */

    /**
     * filling expression Columns and ExpressionsTable based on known values of
     */
    useEffect(() => {
        const runs = selectedSamples.map(s=>s.run)
        const cols = baseOrthologyColumnDefs.concat(
            runs.map(run => (
                {
                    headerName: run,
                    field: run,
                    minWidth: 50
                })))
        //console.log("Expression columns are", cols)
        setExpressionsColumnDefs(cols)
        setExpressionsTable(new ExpressionsTable(orthologyData,runs, expressions))
    }, [selectedSamples, orthologyData, expressions])

    useEffect(() => {
        if(expressionsTable.expressions.length > 0){
            //console.log("expressions are", expressionsTable.expressions)
            const rows: Array<ExpressionRow> = expressionsTable.makeRows()
            setExpressionRows(rows)
        }    else{
            setExpressionRows([])
        }
        }
    , [expressionsTable])


    const loadGeneExpressionsClick = async () => {
        const expressions = await fetchExpressions(selectedSamples.map(s=>s.run), orthologyData.all_genes.toArray())
        setExpressions(expressions)
    }

    const downloadClick = () => {
        expressionsGridApi.exportDataAsCsv({fileName: "expressions.csv"});
    }

    return(
        <Segment>
            <Button onClick={loadGeneExpressionsClick}
                    className="ui blue"
                    size="massive" disabled={selectedSamples.length === 0}
            >
                Load gene expressions
            </Button>
            <div className="gridHolder" style={{ height: 'calc(100% - 25px)', width: `calc(100% - 25px)` }}>
                <div className="ag-theme-balham">
                    <AgGridReact
                        rowData={expressionRows}
                        columnDefs={expressionsColumnDefs}
                        gridOptions={expressionsGridOptions}
                        onGridReady={onExpressionsGridReady}
                    />
                </div>
                <Button icon
                        disabled={expressionRows.length === 0}
                        onClick={downloadClick}
                        className="ui blue"
                >
                    <Icon name='download' />
                    Download gene expressions as CSV
                </Button>
            </div>
            { renderHeatMap() }

        </Segment>
        )
}

export default ExpressionsView