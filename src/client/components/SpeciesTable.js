import React, {useEffect, useState} from 'react'
import {Image, Table} from 'semantic-ui-react'
import {List, fromJS, Map} from "immutable"

export const SpeciesTable = ({selectedRows, selectedSpecies, setSelectedSpecies, unique}) => {

    const round = (value) => {
        const num = value==="" ? "N/A": Number(value)
        return isNaN(num) ? "N/A" : Math.round((num + Number.EPSILON) * 100) / 100
    }

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
    useEffect(()=>{
        setSelectedSpecies(unique(selectedRows.map(speciesFromRow)))
    }, [selectedRows])



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
                <Table.Cell>{round(species.lifespan)}</Table.Cell>
                <Table.Cell>{!isNaN(species.mass_g)? round(species.mass_g / 1000.0) : "N/A"}</Table.Cell>
                <Table.Cell>{round(species.metabolic_rate)}</Table.Cell>
                <Table.Cell>{round(species.temperature_celsius)}</Table.Cell>

            </Table.Row>
    )


    return (

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
     )
}

export default SpeciesTable