import React from 'react';


import SpeechToText from './components/SpeechToTextD3Nine';
import LineChart from './components/LineChart';

import ChildD3Jul from './components/ChildD3Jul';


import AudioVisualizer from './components/TestAudioV';

function App() {

  // let data = [
  //   { date: 20220101, impressions: 100 },
  //   { date: 20220102, impressions: 120 }
  //   // ... truncated but you get it
  // ];


  return (
    <div className="App">
      
      
      {/* <LineChart Data={data} /> */}
       
          

      {/* <SpeechToText />  */}

      <AudioVisualizer />
      
      
    
    </div>
  );
}

export default App;
