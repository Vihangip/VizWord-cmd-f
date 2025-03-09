import React from "react";

const Chat = () => {

    const background = {
        backgroundColor: 'var(--cream)',
        borderRadius: 'var(--border)',
        width: '100%',
        height: '100%'
    }

    const chatbox = {
        backgroundColor: 'var(--yellow)',
        width: '100%',
        height: '50%'
    }

    const heading = {
        color: 'var(--purple)',
        font: 'Helvetica-Bold',
        textAlign:'left',
        margin: '0',
        padding: '20px' 
    }

    return (
        <div style={background}>
            <h2 style={heading}>
                Learn with Viz
            </h2>
            <div style={chatbox}>
            </div>
        </div>
    )
}

export default Chat;