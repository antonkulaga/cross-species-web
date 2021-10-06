import React, {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {Divider, Header, Image, Segment, Step, Table} from 'semantic-ui-react'
import {List, fromJS, Map, OrderedSet} from "immutable"
import {AgGridReact} from "ag-grid-react";
import {Sample, Species} from "../../shared/models";
import * as _ from "lodash";

type selectedSpeciesInput = {
    children?: JSX.Element | JSX.Element[];
    selectedRows: Array<Sample>
    selectedSpecies: Array<Species>,
    setSelectedSpecies: Dispatch<SetStateAction<Array<Species>>>,
}

export const SelectedSpecies = ({selectedRows, selectedSpecies, setSelectedSpecies}: selectedSpeciesInput) => {

    const round = (value) => {
        const num: number = value==="" ? Number.NaN: Number(value)
        return isNaN(num) ? "N/A" : Math.round((num + Number.EPSILON) * 100) / 100
    }


    useEffect(()=>{
        const unique_species = _.uniqWith(selectedRows.map(Species.fromSample),_.isEqual)
        //setSelectedSpecies(_.uniq<Species>(selectedRows.map(Species.fromSample)))
        setSelectedSpecies(unique_species)
    }, [selectedRows])



   const speciesRows = selectedSpecies.map(species =>
            <Table.Row key={species.species}>
                <Table.Cell>
                    <Image
                        src={`http://www.ensembl.org/i/species/${species.species.replace(" ", "_")}.png`}
                        as='a'
                        size='tiny'
                        href={species.ensembl_url}
                        target='_blank'
                        circular
                    />
                    </Table.Cell>
                <Table.Cell>{species.species.replace("_", " ")}</Table.Cell>
                <Table.Cell>{species.common_name.replace("_", " ")}</Table.Cell>
                <Table.Cell>{species.taxon}</Table.Cell>
                <Table.Cell>{round(species.lifespan)}</Table.Cell>
                <Table.Cell>{!isNaN(species.mass)? round(species.mass_kg) : "N/A"}</Table.Cell>
                <Table.Cell>{round(species.metabolic_rate)}</Table.Cell>
                <Table.Cell>{round(species.temperature_celsius)}</Table.Cell>

            </Table.Row>
    )


    return (
            <Segment>
                <Divider horizontal>
                    <Header as='h4'>
                        Species in selected samples:
                    </Header>
                </Divider>
                <Table color="blue" inverted compact celled  textAlign="center">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Image</Table.HeaderCell>
                            <Table.HeaderCell>Species</Table.HeaderCell>
                            <Table.HeaderCell>Common name</Table.HeaderCell>
                            <Table.HeaderCell>NCBI taxon</Table.HeaderCell>
                            <Table.HeaderCell>Maximum lifespan</Table.HeaderCell>
                            <Table.HeaderCell>Mass (kg)</Table.HeaderCell>
                            <Table.HeaderCell>Metabolic_rate</Table.HeaderCell>
                            <Table.HeaderCell>Temperature (C)</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {speciesRows}
                    </Table.Body>
                </Table>
            </Segment>

     )
}

export default SelectedSpecies