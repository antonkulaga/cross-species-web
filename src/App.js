import React from 'react'
import { Button, Icon, Menu } from 'semantic-ui-react'

import './App.css';

export default class App extends React.Component {
    state = {
        activeMenu: 'Search'
    }

    handleItemClick = (e, { name }) => this.setState({ activeMenu: name })
    
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
                                            Comparative transcriptomics of Longevity


                                            <div className="sub header">
                                                Computational Biology of Aging Group
                                                <br />
                                                Institute of Biochemistry, Romanian Academy
                                            </div>
                                        </h1>

                                        <div className="ui hidden divider">
                                        </div>

                                        <Menu stackable className="three item tabs">
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
                                <span>jhbsa</span>
                                <div className="ui intro tab" data-tab="introduction">
                                    <div className="ui main" style={{
                                            marginLeft: "30px",
                                            marginRight: "30px"
                                        }}>

                                        <h2 className="ui dividing header">
                                            {/* Search */}
                                            <a className="anchor" id="laur1"></a></h2>
                                            laur1
                                    </div>
                                </div>
                            </div>
                                
                            
                            </div>
                    </div>
                </div>
            </div>
        )
    }
}