import React, { useState, useRef } from 'react';


import Amplify, { Storage, Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';

import awsconfig from '../aws-exports';

import mic from 'microphone-stream';

import * as d3 from 'd3';
import _ from 'lodash';



window.Buffer = window.Buffer || require("buffer").Buffer; 

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());


function SpeechToText(props) {
    const [response, setResponse] = useState("Press 'start recording' to begin your transcription. Press STOP recording once you finish speaking.")
    
    function AudioRecorder(props) {
      const [recording, setRecording] = useState(false);
      const [micStream, setMicStream] = useState();
      const [audioBuffer] = useState(
        (function() {
          let buffer = [];
          function add(raw) {
            buffer = buffer.concat(...raw);
            return buffer;
          }
          function newBuffer() {
            console.log("resetting buffer");
            buffer = [];
          }
   
          return {
            reset: function() {
              newBuffer();
            },
            addData: function(raw) {
              return add(raw);
            },
            getData: function() {
              return buffer;
            }
          };
        })()
      );
  
      async function startRecording() {
        console.log('start recording');
        audioBuffer.reset();
  
        window.navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
          const startMic = new mic();
  
          startMic.setStream(stream);
          startMic.on('data', (chunk) => {
            var raw = mic.toRaw(chunk);
            if (raw == null) {
              return;
            }
            audioBuffer.addData(raw);
  
          });
  
          setRecording(true);
          setMicStream(startMic);
        });
      }
  
      async function stopRecording() {
        console.log('stop recording');
        const { finishRecording } = props;
  
        micStream.stop();
        setMicStream(null);
        setRecording(false);
  
        const resultBuffer = audioBuffer.getData();
  
        if (typeof finishRecording === "function") {
          finishRecording(resultBuffer);
        }
  
      }
  
      return (
        <div className="audioRecorder">
          <div>
            {recording && <button onClick={stopRecording}>Stop recording</button>}
            {!recording && <button onClick={startRecording}>Start recording</button>}
          </div>
        </div>
      );
    }
  
    function convertFromBuffer(bytes) {
      setResponse('Converting text...');
      
      Predictions.convert({
        transcription: {
          source: {
            bytes
          },
          // language: "en-US", // other options are "en-GB", "fr-FR", "fr-CA", "es-US"
        },
      }).then(({ Prediections, transcription, transcription: { fullText } }) => {
        setResponse(fullText); 
        console.log('fulltext result', fullText); 
        console.log('Predictions', Predictions);
        console.log('transcription result', transcription); 
        TranscriptionCL2(fullText)})
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }

    console.log("response", response)

    // D3

    const svgRef = useRef(null);

    let TranscriptionCL2 = function(TextResult) {
    console.log('In a function',TextResult)
    console.log('Length', TextResult.length);

    // length words transcript
    const transcriptLength = TextResult.length;
    console.log('# words in transcript', transcriptLength);

    //Random data for Neme
      
    const randomArray = (length, max) => Array(length).fill().map(() => Math.round(Math.random() * max));

    const maxPretendNeme = 10;
    let randomArrayGenerated = randomArray(transcriptLength, maxPretendNeme);
    console.log('randomArray',randomArrayGenerated);

    // scaleLinear code
    
    const scaleLinear = d3.scaleLinear()
    .domain(d3.extent([0,transcriptLength]))
    .range(d3.extent([0,maxPretendNeme]));
    console.log("test scaleLinear using 1", scaleLinear(1))

    // turn random array into object

    const ArrayToObject = Array(transcriptLength).fill('SAF');
    console.log(ArrayToObject)

    // reduce

    let uu = ['a', 'b', 'c'].reduce((a, v) => ({ ...a, [v]: v}), {}); 
    console.log('test', uu);

    let yy = randomArrayGenerated.reduce((a, v) => ({ ...a, [v]: 'SAF'}), {});
    console.log('test 6', yy);

    };

    // end
  
    return (
      <div className="Text">
        <div>
          <h3>Speech to text</h3>
          <AudioRecorder finishRecording={convertFromBuffer} />
          <p>{response}</p>
        </div>
      </div>
    );
  }

 export default SpeechToText;