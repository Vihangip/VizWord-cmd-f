import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function DropdownMenu() {
    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };
    
    const vSpace = 10;

    const select = {
        width: 300,
        backgroundColor: 'var(--white)'
    }

    return (
        <FormControl variant="filled">
            <InputLabel id="demo-simple-select-outlined-label">Select Your Learning Language</InputLabel>
            <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={selectedOption}
                onChange={handleChange}
                autoWidth
                label="Select your Learning Language"
                style={select}
            >
                <MenuItem value={vSpace}>English</MenuItem>
                <MenuItem value={2*vSpace}>French</MenuItem>
                <MenuItem value={3*vSpace}>German</MenuItem>
                <MenuItem value={4*vSpace}>Mandarin</MenuItem>
                <MenuItem value={5*vSpace}>Spanish</MenuItem>
                <MenuItem value={6*vSpace}>Tamil</MenuItem>
            </Select>
        </FormControl>
    );
};

export default DropdownMenu;