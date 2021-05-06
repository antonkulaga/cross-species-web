import React, {useEffect, useState} from 'react'
import {Image, Table} from 'semantic-ui-react'
import {List, fromJS, Map} from "immutable"

export const SpeciesTable = ({selectedRows}) => {

    const speciesFromRow = (row) => {
        return {
            organism: row.organism,
            common_name: row.common_name,
            taxon: row.taxon,
            lifespan: row.lifespan,
            mass_g: row.mass_g,
            metabolic_rate: row.metabolic_rate,
            temperature_celsius: row.temperature_celsius,
            ensembl_url: row.ensembl_url
        }
    }


    const selectedSpecies = List(selectedRows)
        .map(speciesFromRow)
        .map(x => fromJS(x))//TODO: fix this ugly workaround for deduplication
        .toOrderedSet()
        .map(x => x.toJS())


   const speciesRows = selectedSpecies.map(species =>
            <Table.Row key={species.organism}>
                <Table.Cell>
                    <Image
                        src={`http://www.ensembl.org/i/species/${species.organism.replace(" ", "_")}.png`}
                        as='a'
                        size='tiny'
                        href={species.ensembl_url}
                        target='_blank'
                        circular
                    />
                    </Table.Cell>
                <Table.Cell>{species.organism}</Table.Cell>
                <Table.Cell>{species.common_name}</Table.Cell>
                <Table.Cell>{species.taxon}</Table.Cell>
                <Table.Cell>{!isNaN(species.lifespan) ? species.lifespan : "no data"}</Table.Cell>
                <Table.Cell>{!isNaN(species.mass_g)? species.mass_g / 1000 : "no data"}</Table.Cell>
                <Table.Cell>{!isNaN(species.metabolic_rate) ? species.metabolic_rate : "no data"}</Table.Cell>
                <Table.Cell>{!isNaN(species.temperature_celsius)? species.temperature_celsius : "no data"}</Table.Cell>

            </Table.Row>
    )
        return (

                <Table color="blue" inverted compact celled  textAlign="center">
                    <Table.Header>
                        <Table.HeaderCell>Image</Table.HeaderCell>
                        <Table.HeaderCell>Species</Table.HeaderCell>
                        <Table.HeaderCell>Common name</Table.HeaderCell>
                        <Table.HeaderCell>NCBI taxon</Table.HeaderCell>
                        <Table.HeaderCell>Maximum lifespan</Table.HeaderCell>
                        <Table.HeaderCell>Mass (kg)</Table.HeaderCell>
                        <Table.HeaderCell>Metabolic_rate</Table.HeaderCell>
                        <Table.HeaderCell>Temperature (C)</Table.HeaderCell>
                    </Table.Header>
                    <Table.Body>
                        {speciesRows}
                    </Table.Body>
                </Table>
         )
}

export default SpeciesTable