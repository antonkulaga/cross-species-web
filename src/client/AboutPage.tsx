import React from 'react'

import './app.css';

export default class SearchPage extends React.Component {

    render() {
        return (
            <div className="ui intro">
                <div className="ui main" style={{
                        marginLeft: "30px",
                        marginRight: "30px"
                    }}>
                    <span>About page</span>
                    <div className="ui three top attached steps">
                        <div className="step">
                            <i className="icon"></i>
                            <div className="content">
                                <div className="title">Select reference species (Homo sapiens by default)</div>
                                <div className="description">First you select a reference species for which genes the search is conducted</div>
                            </div>
                        </div>
                        <div className="active step">
                            <i className="icon"></i>
                            <div className="content">
                                <div className="title">Choose genes or gene sets</div>
                                <div className="description">Enter gene symbols in the reference organism for which orthologs you want to look at</div>
                            </div>
                        </div>
                        <div className="disabled step">
                            <i className="info icon"></i>
                            <div className="content">
                                <div className="title">Get expression values</div>
                                <div className="description">Expression values are displayed as heatmap and downloadable orthology table</div>
                            </div>
                        </div>
                    </div>
                    <div className="ui attached segment">
                        <p></p>
                    </div>
                    <h2 className="ui dividing header"></h2>
                </div>
            </div>
        );
    }
}