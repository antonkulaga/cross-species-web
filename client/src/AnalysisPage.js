import React from 'react'

import './App.css';

export default class SearchPage extends React.Component {

    render() {
        return (
            <div className="ui intro">
                <div className="ui main" style={{
                        marginLeft: "30px",
                        marginRight: "30px"
                    }}>
                    <span>Analysis page</span>

                    <h2 className="ui dividing header"></h2>
                </div>
            </div>
        );
    }
}