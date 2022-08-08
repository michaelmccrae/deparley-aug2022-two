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

        // console.log('resultbuffer', resultBuffer)
        // console.log('finishRecording', finishRecording)
        
  
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
        
        TranscriptionCL2(fullText)})
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }

    console.log("response", response)

    // D3

    const svgRef = useRef(null);

    let TranscriptionCL2 = function(TextResult) {
    console.log('In a function',TextResult);
    console.log('type of TextResults', typeof(TextResult));
    // console.log('Length', TextResult.length) DOESN'T WORK

    // length work around
    const SplitTextResult = TextResult.split(' ');
    const SplitSize = _.size(SplitTextResult);
    console.log("Split and size method length", SplitSize);

    
    //Random data for Neme
      
    const randomArray = (length, max) => Array(length).fill().map(() => Math.round(Math.random() * max));

    const maxPretendNeme = 10;
    let randomArrayGenerated = randomArray(SplitSize, maxPretendNeme);
    console.log('randomArray',randomArrayGenerated);

    // turn random array into object

    const ArrayToObject = Array(SplitSize).fill('SAF');
    console.log('ArrayToObject', ArrayToObject)


    // random neme object test example

    var keys = ['foo', 'bar', 'baz'];
    var values = [11, 22, 33]

    var result = {};
    keys.forEach((key, i) => result[key] = values[i]);
    console.log('combo results test example', result);

    // example four

    var obj = {
        key1: []
      };
      
      obj.key1.push("something"); // useing the key directly
      obj['key1'].push("something else"); // using the key reference
      
      console.log('example four',obj);

    // combine neme rando figures array and SAF to make object

    let randoObjectNeme = {};
    ArrayToObject.forEach((ArrayToObject, i) => randoObjectNeme[ArrayToObject] = randomArrayGenerated[i]);
    console.log('randoObjectNeme', randoObjectNeme)

    // scaleLinear code
    
    const scaleLinear = d3.scaleLinear()
    .domain(d3.extent([0,SplitSize]))
    .range(d3.extent([0,maxPretendNeme]));
    console.log("test scaleLinear using 1", scaleLinear(1))

    
    // reduce

    let uu = ['a', 'b', 'c'].reduce((a, v) => ({ ...a, [v]: v}), {}); 
    console.log('Test reduce function', uu);

    
    const NemeRandoToOjbect = randomArrayGenerated.reduce((a, v) => ({ ...a, [v]: 'SAF'}), {});
    console.log('Neme Rando To Object', NemeRandoToOjbect);
    console.log('Neme Rando To Object TypeOf', typeof(NemeRandoToOjbect));
    const InvertNemeRandoToOjbect = Object.entries(NemeRandoToOjbect).reduce((obj, [key, value]) => ({ ...obj, [value]: key }), {});
    console.log('Neme Rando SAF Invert', InvertNemeRandoToOjbect);

    
    

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