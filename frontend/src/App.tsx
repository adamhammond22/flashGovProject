import React, { useState } from 'react';
import flashGovLogo from './flashGovLogo.png';
import './App.css';
import { Button } from 'react-bootstrap';

function App() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img 
          style={{width: '600px'}}
          src={flashGovLogo} 
          alt="logo"
        />
        <Button onClick={() => setClickCount(clickCount + 1)}>
          Clicked {clickCount} times
        </Button>
      </header>
    </div>
  );
}
export default App;
