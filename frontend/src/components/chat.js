import React, { useState, useEffect } from "react";

const Chat = ({ props }) => {
  const [messages, setMessages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showReset, setShowReset] = useState(false);
  
  useEffect(() => {
    console.log("Props changed:", props);
    resetChat();
  }, [props]);
  
  const resetChat = (newProps = props) => {
    setShowOptions(false);
    setShowReset(false);
    
    // Case 1: No props at all
    if (!newProps) {
      setMessages([{
        text: "Capture an image to learn more!",
        fromUser: false
      }]);
      return;
    }
  
    // For debugging - log the exact props structure
    console.log("Reset chat with props:", JSON.stringify(newProps));
  
    // Case 2: We have an object with the required properties
    const hasTranslation = newProps.translation && newProps.translation !== "";
    const hasObject = newProps.object && newProps.object !== "";
  
    if (hasTranslation && hasObject) {
      setMessages([{
        text: `This object is called ${newProps.translation}`,
        fromUser: false
      }]);
  
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `Would you like to know more about the ${newProps.object}?`,
          fromUser: false
        }]);
        setShowOptions(true);
      }, 1000);
    } 
    // Case 3: We have props but missing required data
    else {
      const objectName = hasObject ? newProps.object : "this object";
      
      setMessages([{
        text: `This is ${objectName}`,
        fromUser: false
      }]);
  
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `Would you like to know more about ${objectName}?`,
          fromUser: false
        }]);
        setShowOptions(true);
      }, 1000);
    }
  };
  
  
  const handleYesClick = () => {
    // Add user response
    setMessages(prev => [...prev, {
      text: "Yes",
      fromUser: true
    }]);
    
    setShowOptions(false);
    
    // Debug the adjectives array
    console.log("Adjectives check:", props?.adjectives);
    console.log("Adjectives type:", props?.adjectives ? typeof props.adjectives : "undefined");
    console.log("Is array:", props?.adjectives ? Array.isArray(props.adjectives) : "N/A");
    
    // Try parsing adjectives if it's a string
    let adjectivesArray = props?.adjectives;
    
    if (props?.adjectives && typeof props.adjectives === 'string') {
      try {
        adjectivesArray = JSON.parse(props.adjectives);
        console.log("Parsed adjectives from string:", adjectivesArray);
      } catch (e) {
        console.error("Failed to parse adjectives string:", e);
      }
    }
    
    // Check if we have valid adjectives to display
    if (
      props && 
      adjectivesArray && 
      (Array.isArray(adjectivesArray) || typeof adjectivesArray === 'object') && 
      (Array.isArray(adjectivesArray) ? adjectivesArray.length > 0 : Object.keys(adjectivesArray).length > 0)
    ) {
      showNextAdjective(0, adjectivesArray);
    } else {
      // Handle the case where adjectives might be missing
      console.log("No valid adjectives found");
      setMessages(prev => [...prev, {
        text: "Sorry, I don't have additional information about this object.",
        fromUser: false
      }]);
      setShowReset(true);
    }
  };
  
  const handleNoClick = () => {
    // Add user response and show reset button
    setMessages(prev => [...prev, {
      text: "No",
      fromUser: true
    }]);
    
    setShowOptions(false);
    setShowReset(true);
  };
  
  const showNextAdjective = (index, adjectivesArray) => {
    // Safety check for props and necessary properties
    if (!props || !adjectivesArray) {
      setShowReset(true);
      return;
    }
    
    // Convert to array if it's an object but not an array
    const adjArray = Array.isArray(adjectivesArray) 
      ? adjectivesArray 
      : Object.values(adjectivesArray);
    
    console.log("Processing adjectives:", adjArray);
    console.log("Current index:", index);
    
    const objectName = props.object || "this object";
    
    if (index < adjArray.length) {
      const adjective = adjArray[index];
      
      console.log("Current adjective:", adjective);
      
      // Add delay before showing the next adjective
      setTimeout(() => {
        // Check if adjective is valid
        if (adjective) {
          // Handle different possible structures of the adjective object
          let engText = "";
          let transText = "";
          
          if (typeof adjective === 'string') {
            // If adjective is just a string
            engText = adjective;
            transText = adjective;
          } else if (typeof adjective === 'object') {
            // If adjective is an object with properties
            engText = adjective.english || ""; 
            transText = adjective.translation || "";
          }
          
          let message = `The ${objectName} is `;
          
          if (transText && engText && transText !== engText) {
            message += `${transText} (${engText})`;
          } else if (transText) {
            message += transText;
          } else if (engText) {
            message += engText;
          } else {
            // Skip this adjective if both are empty
            showNextAdjective(index + 1, adjArray);
            return;
          }
          
          setMessages(prev => [...prev, {
            text: message,
            fromUser: false
          }]);
        }
        
        // Schedule the next adjective or show reset button after last adjective
        if (index < adjArray.length - 1) {
          showNextAdjective(index + 1, adjArray);
        } else {
          setTimeout(() => {
            setShowReset(true);
          }, 1000);
        }
      }, 1000);
    } else {
      setShowReset(true);
    }
  };

  const handleResetClick = () => {
    setShowReset(false); // Hide reset button
    resetChat(null);  // Reset with no props
  };
  
  
  // Styles
  const background = {
    backgroundColor: 'var(--cream)',
    borderRadius: 'var(--border)',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };
  
  const heading = {
    color: 'var(--purple)',
    textAlign: 'left',
    margin: '0',
    padding: '20px' 
  };
  
  const chatbox = {
    backgroundColor: 'var(--yellow)',
    height: '40%',
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };
  
  const messageLeft = {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '10px 15px',
    maxWidth: '70%'
  };
  
  const messageRight = {
    alignSelf: 'flex-end',
    backgroundColor: 'var(--purple)',
    color: 'white',
    borderRadius: '12px',
    padding: '10px 15px',
    maxWidth: '70%'
  };
  
  const optionsContainer = {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  };
  
  const optionButton = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
  };
  
  const yesButton = {
    ...optionButton,
    backgroundColor: 'var(--purple)',
    color: 'white'
  };
  
  const noButton = {
    ...optionButton,
    backgroundColor: 'white',
    border: '1px solid var(--purple)',
    color: 'var(--purple)'
  };
  
  const resetButton = {
    ...optionButton,
    backgroundColor: 'var(--purple)',
    color: 'white',
    marginTop: '15px'
  };
  
  return (
    <div style={background}>
      <h2 style={heading}>
        Learn with Viz
      </h2>
      <div style={chatbox}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            style={message.fromUser ? messageRight : messageLeft}
          >
            {message.text}
          </div>
        ))}
        
        {showOptions && (
          <div style={optionsContainer}>
            <button style={yesButton} onClick={handleYesClick}>Yes</button>
            <button style={noButton} onClick={handleNoClick}>No</button>
          </div>
        )}
        
        {showReset && (
        <button style={resetButton} onClick={handleResetClick}>
            New Object
        </button>
        )}
      </div>
    </div>
  );
};

export default Chat;