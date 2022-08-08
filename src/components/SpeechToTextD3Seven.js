import React, { useState, useRef, useEffect } from 'react';


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
    const [response, setResponse] = useState()
    
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
        
       })
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }

    console.log("response", response)

    
    const svgRef = useRef(null);

    // useEffect

    useEffect(
        () => {
            if(response)
             {
    
        async function mungedAWSNeme() {
            const rawAWS = await d3.csv('https://gist.githubusercontent.com/michaelmccrae/3f278586889f3b96652fc503b652595d/raw/61f59ae448793fb72c40a56f5113c016b600891d/ClintonMungeVerOne', d3.autoType);
            const rawNeme = await d3.json('https://gist.githubusercontent.com/michaelmccrae/a27fa8443270e58128c449dcc571d80a/raw/003699a491e53a36b702c8c10a05cc3cca23c56a/gistfile1.json', d3.autoType);
            const completedMergedObject = response;
                   
            
           // return rawAWS
        
            return [rawAWS, rawNeme]
         }

    // D3

    const TextResult = response;

    console.log('textresult is response if useEffect', TextResult)

    
    // console.log('Length', TextResult.length) DOESN'T WORK

    // length work around
    const SplitTextResult = TextResult.split(' ');
    const SplitSize = _.size(SplitTextResult);
    console.log("Split and size method length", SplitSize);

    
    //Random data for Neme
      
    const randomArray = (length, max) => Array(length).fill().map(() => Math.round(Math.random() * max));

    const maxPretendNeme = 10;
    let SAF = randomArray(SplitSize, maxPretendNeme);
    console.log('SAF',SAF);

    
    // turn random Neme into an object

    let randoNemeObject = Object.assign({}, {SAF});
    console.log ('randoNemeObject', randoNemeObject);

    
    // turn text result into object
    
    let Text = Object.assign({}, {SplitTextResult});
    console.log ('Text', Text);

    // merge

    let mergedObjects = _.merge(Text, randoNemeObject);
    console.log('mergedObjects', mergedObjects);      

 
    // scaleLinear code
    
    const scaleLinear = d3.scaleLinear()
    .domain(d3.extent([0,SplitSize]))
    .range(d3.extent([0,maxPretendNeme]));
    console.log("test scaleLinear using 1", scaleLinear(1))

    // color scale HARD CODED EXTENT TO TEN !!!!!!!!!!!! SINCE RANDOM
    let myColor = d3.scaleSequential()
    .domain(d3.extent([0,10]))
    .interpolator(d3.interpolateBlues);

    
    

}} ,[svgRef.current])


    
  
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