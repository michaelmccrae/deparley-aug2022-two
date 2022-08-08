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




function SpeechToTextwD3One(props) {
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
      }).then(({ transcription: { fullText } }) => setResponse(fullText))
      .then(ResponseModel(response))
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }

    // testing transcription return
    
    // console.log("response from transcribe", response);

    // console.log("response from transcribe length", response.length);

    // create made up Neme for testing

    function ResponseModel (data) {
    
    let max = 10;
    let lengthResponse = data.length;
    let randomNemeArray = Array(lengthResponse).fill().map(() => Math.round(Math.random() * max));
    console.log("Made up Neme array", randomNemeArray);
    }


    // D3 Old

    const svgRef = useRef(null);
    
    useEffect(
        () => {
            if(svgRef.current)
             {
    
        async function mungedAWSNeme() {
            const rawAWS = await d3.csv('https://gist.githubusercontent.com/michaelmccrae/3f278586889f3b96652fc503b652595d/raw/61f59ae448793fb72c40a56f5113c016b600891d/ClintonMungeVerOne', d3.autoType);
            const rawNeme = await d3.json('https://gist.githubusercontent.com/michaelmccrae/a27fa8443270e58128c449dcc571d80a/raw/003699a491e53a36b702c8c10a05cc3cca23c56a/gistfile1.json', d3.autoType);
        
            
           // return rawAWS
        
            return [rawAWS, rawNeme]
         }
          
            mungedAWSNeme().then( function (data) {
        
            console.log('resolved data', data);
        
            // munge AWS
        
            const aloneAWS = data[1]
            const transcript = Object.values(aloneAWS.results.transcripts[0]);
            const transcriptSeparate = _.split(transcript," ");
            const transcriptObject = transcriptSeparate.map(function(d) { return {word: d } });
            console.log('resolved transcriptObject', transcriptObject)
        
            //munge Neme
        
            const aloneNeme = data[0]
            const setSAFObject = aloneNeme.map( x => _.pick(x, "SAF"));
            console.log("Nemesysco", setSAFObject);
        
            // AWS length
        
            const transcriptLength = transcriptSeparate.length
            console.log('# words in transcript', transcriptLength)
        
            //Neme length
        
            const setNumbers = aloneNeme.map(d=>d.SAF)
            const segLength = setNumbers.length
            console.log('# results in Neme', segLength)
            console.log('set numbers', setNumbers)
        
            // random array for Neme
            // const randomNemeInput = 7 +(Math.floor(Math.random() * 10 ));
            // let randomArrayNeme = Array(randomNemeInput).fill().map(() => Math.round(Math.random() * randomNemeInput))
            // console.log("random array for Neme", randomArrayNeme)
        
            // scaleLinear code
        
            const transcriptSeparateLength = transcriptSeparate.length;
            const scaleLinear = d3.scaleLinear()
            .domain(d3.extent([0,transcriptSeparateLength]))
            .range(d3.extent(setNumbers))
        
            console.log("test scaleLinear using 1", scaleLinear(1))
        
            // object of scaleLinear neme
        
            let longNemeScaleLinear = [];
        
            for (var x = 0; x < transcriptSeparate.length; x++) {
                var e = scaleLinear(x)
                var y = Math.floor(e)
                var z = _.nth(setNumbers, y);
                longNemeScaleLinear.push(z);
                //return longNemeScaleLinear;
                };
        
                let longObjectNeme = longNemeScaleLinear.map((v,i) => ({...v, 'SAF': v}))
                console.log("Neme long array", longNemeScaleLinear);
                console.log("Neme long object", longObjectNeme);
        
                // randomized Neme
                // let longObjectNemeRandom = randomArrayNeme.map((v,i) => ({...v, 'SAF': v}))
                // console.log("Neme long object random", longObjectNemeRandom);
            
                // merge AWS and Neme objects 
                const mergedObjects = _.merge(transcriptObject,longObjectNeme);
                console.log('merged Neme and AWS', mergedObjects);
        
                // color scale
                let myColor = d3.scaleSequential()
                .domain(d3.extent(setNumbers))
                .interpolator(d3.interpolateBlues);
    
                // useRef
                let svg = d3.select(svgRef.current)
        
                // join data to html WORKS
               svg.selectAll("span")
                .data(mergedObjects)
                .join("span")
                //.style("color", "red")
                .style("font-size","40px")
                .style("font-family","Impact")
                .style("color", function(d){return myColor(d.SAF) })
                .text(d => d.word+ " ");
    
              });
            }
    },[svgRef.current])

    //end D3
  
    return (
      <div className="Text">
        <div>
          <h3>Speech to text</h3>
          <AudioRecorder finishRecording={convertFromBuffer} />
          <p>{response}</p>
          
          <p ref={svgRef} id="D3Return"></p>
        </div>
      </div>
    );
  }


function App() {
  return (
    <div className="App">
     

      Transcribe Audio
      <SpeechToTextwD3One />
      <br/>
     

    </div>
  );
}

export default SpeechToTextwD3One;