import React from 'react'

import './App.css';

import SamplesGrid from './SamplesGrid'

export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
        }
    }
    render() {
        return (
            <div className="ui intro">
                <div className="ui main" style={{
                        margin: "30px"
                    }}>
                    <SamplesGrid />


                    <h3 className="ui header">Choose genes or gene sets</h3>
                    <div id="gene_symbols_search_selection" className="ui fluid search dropdown selection multiple">
                        <select multiple="">
                            <option value="">Gene symbols</option>
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                            <option value="DC">District Of Columbia</option>
                            <option value="FL">Florida</option>
                            <option value="GA">Georgia</option>
                            <option value="HI">Hawaii</option>
                            <option value="ID">Idaho</option>
                            <option value="IL">Illinois</option>
                            <option value="IN">Indiana</option>
                            <option value="IA">Iowa</option>
                            <option value="KS">Kansas</option>
                            <option value="KY">Kentucky</option>
                            <option value="LA">Louisiana</option>
                            <option value="ME">Maine</option>
                            <option value="MD">Maryland</option>
                            <option value="MA">Massachusetts</option>
                            <option value="MI">Michigan</option>
                            <option value="MN">Minnesota</option>
                            <option value="MS">Mississippi</option>
                            <option value="MO">Missouri</option>
                            <option value="MT">Montana</option>
                            <option value="NE">Nebraska</option>
                            <option value="NV">Nevada</option>
                            <option value="NH">New Hampshire</option>
                            <option value="NJ">New Jersey</option>
                            <option value="NM">New Mexico</option>
                            <option value="NY">New York</option>
                            <option value="NC">North Carolina</option>
                            <option value="ND">North Dakota</option>
                            <option value="OH">Ohio</option>
                            <option value="OK">Oklahoma</option>
                            <option value="OR">Oregon</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="RI">Rhode Island</option>
                            <option value="SC">South Carolina</option>
                            <option value="SD">South Dakota</option>
                            <option value="TN">Tennessee</option>
                            <option value="TX">Texas</option>
                            <option value="UT">Utah</option>
                            <option value="VT">Vermont</option>
                            <option value="VA">Virginia</option>
                            <option value="WA">Washington</option>
                            <option value="WV">West Virginia</option>
                            <option value="WI">Wisconsin</option>
                            <option value="WY">Wyoming</option>
                        </select>
                        <i className="dropdown icon"></i>
                        <input className="search" autoComplete="off" tabIndex="0"></input>
                        <span className="sizer"></span>
                        <div className="default text">Gene symbols</div>
                        <div className="menu transition hidden" tabIndex="-1">
                            <div className="item selected" data-value="AL">Alabama</div>
                            <div className="item" data-value="AK">Alaska</div>
                            <div className="item" data-value="AZ">Arizona</div>
                            <div className="item" data-value="AR">Arkansas</div>
                            <div className="item" data-value="CA">California</div>
                            <div className="item" data-value="CO">Colorado</div>
                            <div className="item" data-value="CT">Connecticut</div>
                            <div className="item" data-value="DE">Delaware</div>
                            <div className="item" data-value="DC">District Of Columbia</div>
                            <div className="item" data-value="FL">Florida</div>
                            <div className="item" data-value="GA">Georgia</div>
                            <div className="item" data-value="HI">Hawaii</div>
                            <div className="item" data-value="ID">Idaho</div>
                            <div className="item" data-value="IL">Illinois</div>
                            <div className="item" data-value="IN">Indiana</div>
                            <div className="item" data-value="IA">Iowa</div>
                            <div className="item" data-value="KS">Kansas</div>
                            <div className="item" data-value="KY">Kentucky</div>
                            <div className="item" data-value="LA">Louisiana</div>
                            <div className="item" data-value="ME">Maine</div>
                            <div className="item" data-value="MD">Maryland</div>
                            <div className="item" data-value="MA">Massachusetts</div>
                            <div className="item" data-value="MI">Michigan</div>
                            <div className="item" data-value="MN">Minnesota</div>
                            <div className="item" data-value="MS">Mississippi</div>
                            <div className="item" data-value="MO">Missouri</div>
                            <div className="item" data-value="MT">Montana</div>
                            <div className="item" data-value="NE">Nebraska</div>
                            <div className="item" data-value="NV">Nevada</div>
                            <div className="item" data-value="NH">New Hampshire</div>
                            <div className="item" data-value="NJ">New Jersey</div>
                            <div className="item" data-value="NM">New Mexico</div>
                            <div className="item" data-value="NY">New York</div>
                            <div className="item" data-value="NC">North Carolina</div>
                            <div className="item" data-value="ND">North Dakota</div>
                            <div className="item" data-value="OH">Ohio</div>
                            <div className="item" data-value="OK">Oklahoma</div>
                            <div className="item" data-value="OR">Oregon</div>
                            <div className="item" data-value="PA">Pennsylvania</div>
                            <div className="item" data-value="RI">Rhode Island</div>
                            <div className="item" data-value="SC">South Carolina</div>
                            <div className="item" data-value="SD">South Dakota</div>
                            <div className="item" data-value="TN">Tennessee</div>
                            <div className="item" data-value="TX">Texas</div>
                            <div className="item" data-value="UT">Utah</div>
                            <div className="item" data-value="VT">Vermont</div>
                            <div className="item" data-value="VA">Virginia</div>
                            <div className="item" data-value="WA">Washington</div>
                            <div className="item" data-value="WV">West Virginia</div>
                            <div className="item" data-value="WI">Wisconsin</div>
                            <div className="item" data-value="WY">Wyoming</div>
                        </div>
                    </div>
                    <br/> 
                    <span>or choose a predefined list:</span>
                    {/* <div style="width: 50%; display: inline"> */}
                    <div id="gene_lists" className="ui selection fluid dropdown" multiple="">
                        <i className="dropdown icon"></i>
                        <div className="default text">Select predefined list of genes</div>
                        <div className="menu">
                        <div className="item" data-value="Pro-Longevity Genes">Pro-Longevity Genes</div>
                        <div className="item" data-value="Anti-Longevity Genes">Anti-Longevity Genes</div>
                        <div className="item" data-value="Pro-Lifespan Genes">Pro-Lifespan Genes</div>
                        <div className="item" data-value="Anti-Lifespan Genes">Anti-Lifespan Genes</div>
                        <div className="item" data-value="DNA Repair genes">DNA Repair genes</div>
                        <div className="item" data-value="Autophagy genes">Autophagy genes</div>
                        <div className="item" data-value="My custom gene list">My custom gene list</div>
                        </div>
                    </div>
                    {/* </div> */}
                    
                <span>or upload your custom list:</span>
                <div className="field is-horizontal"  style={{marginTop: "24px"}}>
                    <div className="field-label">
                    <label className="label">Upload list of gene ENSEMBL IDs or symbols</label>
                    </div>
                    <div className="field-body" style={{marginTop: "10px"}}>
                    <div className="msg-wrapper">
                        <div className="field is-grouped">{/**/} 
                        <div className="field file">{/**/}
                            <label className="upload control">
                            <a className="button is-outlined is-small">
                                <span className="icon is-small"><i className="mdi mdi-upload">
                                
                                </i></span><span></span></a> <input type="file" accept=".txt" name="gene_list_file"></input>
                            </label> {/**/} {/**/}
                        </div>  {/**/}
                        </div> {/**/}
                    </div>
                    </div>
                </div>
                <div className="field is-horizontal">
                    <div className="field-label">
                    <label className="label">
                        
                    </label>
                    </div>
                    <div className="field-body">
                    <div className="gene-list-wrapper" style={{marginTop: "10px"}}>
                        <p className="or-spacer has-text-primary">OR</p> 
                        <div className="field">{/**/} <div style={{position: "relative"}}>
                        <a className="delete is-small input-clear"></a> 
                        <div className="control is-clearfix">
                            <textarea 
                            style={{
                                width: "400px", 
                                height: "150px"
                                }} 
                            placeholder="Please enter gene ids..." 
                            name="gene_list" 
                            className="textarea"></textarea> 
                        </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    </div>

                    {/* <h3 className="ui header">Results - heatmap</h3> */}
                    <div style={{marginTop: "24px"}}>
                    <button className="ui positive button" id="show_results">
                        Show results
                    </button>
                    </div>
                    <div id="genes_heatmap"></div>
                </div>
            </div>
        );
    }
}