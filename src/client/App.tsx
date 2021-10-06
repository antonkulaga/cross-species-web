import React, { createRef, useState }  from 'react'

import './app.css';

import SearchPage from './SearchPage'
import AnalysisPage from './AnalysisPage'
import AboutPage from './AboutPage'

import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom"
import {
    Menu,
    Icon,
    Divider,
    Step,
    Header, Segment
} from 'semantic-ui-react';
import {DataPage} from "./DataPage";


export const App = () => {

    return (
        <Router>
            <div className="min-vh-100 w-100 flex flex-column "> {/*items-center justify-center*/}
                    <div className="ui masthead vertical segment"> {/* tab */}
                        <div className="ui" style={{
                                marginLeft: "30px",
                                marginRight: "30px"
                            }}>
                          <Menu color="blue" icon tabular fixed="top">
                              <Menu.Menu position='right'>
                                  <Menu.Item name="Cross-species gene expression database">
                                      <Header className="ui blue inverted compact segment">
                                          <i className="ui dragon icon"> </i>
                                          About Cross-species gene expression database
                                      </Header>
                                  </Menu.Item>
                              </Menu.Menu>
                          </Menu>

                        </div>
                    </div>
                <Divider horizontal> </Divider>
                    <Switch>
                            <Route path="/">
                                    <SearchPage/>
                            </Route>
                            <Route path="/data">
                                <DataPage/>
                            </Route>
                    </Switch>
            </div>
        </Router>

    )
}
export default App