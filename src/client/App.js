import React from 'react'
import { Menu } from 'semantic-ui-react'

import './app.css';

import SearchPage from './SearchPage'
import AnalysisPage from './AnalysisPage'
import AboutPage from './AboutPage'
const { matches } = require('z')

import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';



export default class App extends React.Component {
    state = {
        activeMenu: 'Search'
    }

    handleItemClick = (e, { name }) => this.setState({ activeMenu: name })
    
    renderPage(page) {
        switch(page){
            case 'Analysis':
                return <AnalysisPage />
            case 'About':
                return <AboutPage />
            default:
                return <SearchPage />
        }
    }

    render() {
        const { activeMenu } = this.state
        return (
            <div className="min-vh-100 w-100 flex flex-column "> {/*items-center justify-center*/}
                <div className="pusher">
                    <div className="full height">
                        <div className="article">
                            <div className="ui masthead vertical segment"> {/* tab */}
                                <div className="ui" style={{
                                        marginLeft: "30px",
                                        marginRight: "30px"
                                    }}>
                                    <div className="introduction">
                                        <h1 className="ui header">
                                            <i className="dragon icon"></i>
                                            Cross-species gene expression database
                                        </h1>

                                        <div className="ui hidden divider">
                                        </div>

                                        <Menu stackable className="blue inverted three item large tabs">
                                            <Menu.Item
                                                name='Search'
                                                data-tab="laur1"
                                                active={activeMenu === 'Search'}
                                                onClick={this.handleItemClick}
                                            >
                                                Search
                                            </Menu.Item>

                                            <Menu.Item
                                                name='Analysis'
                                                data-tab="laur2"
                                                active={activeMenu === 'Analysis'}
                                                onClick={this.handleItemClick}
                                            >
                                                Analysis
                                            </Menu.Item>

                                            <Menu.Item
                                                name='About'
                                                active={activeMenu === 'About'}
                                                onClick={this.handleItemClick}
                                            >
                                                About
                                            </Menu.Item>
                                        </Menu>
                                    </div>
                                </div>
                                
                                {
                                    this.renderPage(activeMenu)
                                }
                            </div>
                                
                            
                            </div>
                    </div>
                </div>
            </div>
        )
    }
}