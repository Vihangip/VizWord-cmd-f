import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const DropdownMenu = ({ selectedLanguage, setSelectedLanguage }) => {
    const handleChange = (event) => {
        setSelectedLanguage(event.target.value);
    };
    
    const select = {
        width: 300,
        borderRadius: 'var(--border)'
    }

    return (
        <FormControl variant="filled" style={{backgroundColor: 'var(--white)', borderRadius: 'var(--border)'}}>
            <InputLabel id="demo-simple-select-outlined-label">Select Your Learning Language</InputLabel>
            <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={selectedLanguage}
                onChange={handleChange}
                autoWidth
                label="Select your Learning Language"
                style={select}
            >
                <MenuItem value={"French"}>French</MenuItem>
                <MenuItem value={"German"}>German</MenuItem>
                <MenuItem value={"Mandarin"}>Mandarin</MenuItem>
                <MenuItem value={"Spanish"}>Spanish</MenuItem>
                <MenuItem value={"Spanish"}>Turkish</MenuItem>
            </Select>
        </FormControl>
    );
};

export default DropdownMenu;