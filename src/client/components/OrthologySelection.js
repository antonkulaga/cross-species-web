import React, {useEffect} from 'react'
import {Dropdown, Image, List, Tab, Table} from 'semantic-ui-react'
import Select from "react-dropdown-select";

//TODO: FINISH MOVING TO Orthology Selection

const PREDEFINED_GENES = [
    { key: 'Yspecies Pro-Longevity Genes', value: 'Yspecies Pro-Longevity Genes', text: 'Yspecies Pro-Longevity Genes' },
    { key: 'Yspecies Top Pro & Anti-Longevity Genes', value: 'Yspecies Top Pro & Anti-Longevity Genes', text: 'Yspecies Top Pro & Anti-Longevity Genes' },
    { key: 'Pro-Longevity Genes', value: 'Pro-Longevity Genes', text: 'Pro-Longevity Genes' },
    { key: 'Anti-Longevity Genes', value: 'Anti-Longevity Genes', text: 'Anti-Longevity Genes' },
    { key: 'Pro-Lifespan Genes', value: 'Pro-Lifespan Genes', text: 'Pro-Lifespan Genes' },
    { key: 'Anti-Lifespan Genes', value: 'Anti-Lifespan Genes', text: 'Anti-Lifespan Genes' },
    { key: 'DNA Repair genes', value: 'DNA Repair genes', text: 'DNA Repair genes' },
    { key: 'Autophagy genes', value: 'Autophagy genes', text: 'Autophagy genes' },
    { key: 'My custom gene list', value: 'My custom gene list', text: 'My custom gene list' }
];

export const OrthologySelection = ({selectedGenesByName, selectedOrganism}) => {

    const onSearchGenes = (values) => {
        // console.log("onSearchGenes", values.state.search);
        let searchTxt = (values.state.search).toUpperCase(); //TODO fix
        // console.log(this.state.genes);
        const { lastSearchGenes } = this.state;
        if (searchTxt.length >= 1 && lastSearchGenes != searchTxt) {
            // console.log("XXXXXX");
            this.setState({ lastSearchGenes: searchTxt });
            const { allGenes } = this.state;
            const filteredGenes = [];

            for (let i = 0; i < allGenes.length; i++) {
                const curr = allGenes[i];

                if ((curr.text).indexOf(searchTxt) === 0) {
                    filteredGenes.push(curr);
                }
            }

            if (filteredGenes.length >= 1) {
                this.setState({ genes: filteredGenes.slice(0, 50) });
            }
        } else {
            // console.log("same search", searchTxt);
        }
    }

    const select_genes_panes = [
        { menuItem: 'By gene names', render: () => <Tab.Pane>
                <Select id="select"
                        placeholder="Search gene symbols"
                        multi
                        options={genes}
                        name="select"
                        values={selectedGenesByName}
                        searchFn={this.onSearchGenes.bind(self)}
                        onChange={this.onChangeGenes.bind(self)}
                /> </Tab.Pane>},
        { menuItem: 'From predefined list', render: () => <Tab.Pane>
                <span>or choose a predefined list:</span>
                <Dropdown
                    placeholder="Select predefined list of genes"
                    fluid
                    search
                    selection
                    options={PREDEFINED_GENES}
                    onChange={this.onChangePredefinedGenes.bind(self)}
                />
            </Tab.Pane> },
        { menuItem: 'By Ensembl ID', render: () => <Tab.Pane>
                <div className="gene-list-wrapper" style={{ marginTop: '10px' }}>
                    <p className="or-spacer has-text-primary">Or paste custom gene ids</p>
                    <div className="field">
                        {/**/}
                        {' '}
                        <div style={{ position: 'relative' }}>
                            <a className="delete is-small input-clear" />
                            <div className="control is-clearfix">
                      <textarea
                          style={{
                              width: '400px',
                              height: '100px'
                          }}
                          onChange={this.handleChangeTextarea.bind(this)}
                          placeholder="Please enter ENSEMBL gene ids..."
                          name="gene_list"
                          className="textarea"
                      />
                            </div>
                        </div>
                    </div>
                </div>


            </Tab.Pane> }
            ]

    return (

    )
}

export default OrthologySelection