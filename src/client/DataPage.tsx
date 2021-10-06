/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/destructuring-assignment */
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import React from 'react';
import {Button, Dropdown, Tab, Step, StepContent, Header, Icon, Image, Message, Divider, Segment} from 'semantic-ui-react';


import './app.css';

import { AgGridReact, AgGridColumn } from 'ag-grid-react';

export const DataPage = () => {

    return (
        <Segment>
            <Message>
                <Message.Header>
                    Download page
                </Message.Header>
                <Message.Content>
                    Most of the data produced by Cross-Species paper
                </Message.Content>
            </Message>
        </Segment>
    )
}