import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function DropdownMenu() {
    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
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
                value={selectedOption}
                onChange={handleChange}
                autoWidth
                label="Select your Learning Language"
                style={select}
            >
                <MenuItem value={1}>English</MenuItem>
                <MenuItem value={2}>French</MenuItem>
                <MenuItem value={3}>German</MenuItem>
                <MenuItem value={4}>Mandarin</MenuItem>
                <MenuItem value={5}>Spanish</MenuItem>
                <MenuItem value={6}>Tamil</MenuItem>
            </Select>
        </FormControl>
    );
};

export default DropdownMenu;