import React, {useState, useEffect, useCallback, useReducer } from 'react'
import {Button, Divider, Dropdown, Header, Icon, Image, List, Step, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";
import _ from "lodash";
import {AgGridReact} from "ag-grid-react";

//NOT YET READY
export const ExpressionsView = (selectedRows) => {
    return(
        <Step disabled={selectedRows.length === 0} >
            <Icon name='dna' />
            <Step.Content>
                <Step.Title><Header>Visualize gene expressions</Header></Step.Title>
            </Step.Content>
        </Step>
        )
}

export default ExpressionsView
//default export ExpressionsView