import React from 'react';
import { Avatar } from '@mui/material';
import DropdownMenu from './dropdown.js';
import Logo from '../images/vizword_logo.png';

const Navbar = () => {
    const background = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--purple)',
        padding: '20px',
        height: '60px',
        fontSize: '18px',
    };

    const leftSide = { 
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '20px'
    }

    const rightSide = { 
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '20px'
    }

    return (
        <div className="nav-bar" style={background} maxWidth={false}>
          <div style={leftSide}>
            <img src={Logo} alt="VizWord Logo" width={60} height={60}/>
            <h1 style={{color: 'var(--white)', font: 'Helvetica-Bold' }}>VizWord</h1>
          </div>
          <div style={rightSide} maxWidth={false}>
            <DropdownMenu/>
            <Avatar alt="Basic user" style={{height: '50px', width: '50px'}}/>
          </div>
        </div>
    )
};

export default Navbar;