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
    const [response, setResponse] = useState("Press 'start recording' to begin your transcription. Press STOP recording once you finish speaking.");
    const [mergedObjects, merging] = useState()
    
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
      }).then(({ transcription: { fullText } }) => {
        setResponse(fullText); 
        console.log('fulltext result', fullText); 
        const fetchData = 'hi';
        TranscriptionCL2(fullText)})
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }

    // console.log("response", response)

    // D3

    

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
    let SAF = randomArray(SplitSize, maxPretendNeme);
    console.log('SAF',SAF);

    
    // turn random Neme into an object

    let randoNemeObject = Object.assign({}, {SAF});
    console.log ('randoNemeObject', randoNemeObject);

    
    // turn text result into object
    
    let Text = Object.assign({}, {SplitTextResult});
    console.log ('Text', Text);

    // merge

    let stuff = _.merge(Text, randoNemeObject);
    console.log('mergedObjects', mergedObjects);

    merging(stuff);

    };

    const svgRef = useRef(null);
    
    useEffect(() => {
      // Check that svg element has been rendered
      if(svgRef.current) {
      console.log('merged object in useEffect', mergedObjects);

    // get mergedObject items length

    if (mergedObjects != null) {
    
    let mergedLength = mergedObjects.SAF.length;
    console.log('mergedLength', mergedLength);

    
    // scaleLinear code BAD CODE REPEAT maxPretendNeme 

    const maxPretendNeme = 10;
    const scaleLinear = d3.scaleLinear()
    .domain(d3.extent([0,mergedLength]))
    .range(d3.extent([0,maxPretendNeme]));
    console.log("test scaleLinear using 1", scaleLinear(1))

    // color scale HARD CODED EXTENT TO TEN !!!!!!!!!!!! SINCE RANDOM
    let myColor = d3.scaleSequential()
    .domain(d3.extent([0,10]))
    .interpolator(d3.interpolateBlues);
    
    // join data to html WORKS

    let svg = d3.select(svgRef.current);

    svg.selectAll("#D3Return")
    .data(mergedObjects)
    .join("span")
    //.style("color", "red")
    .style("font-size","40px")
    .style("font-family","Impact")
    .style("color", function(d){return myColor(d.SAF) })
    .text(d => d.SplitTextResult+ " ")
    .text('test text joe');

    // join data to html WORKS

    // d3.select("body").select("p")
    // .data([1])
    // .enter().append("p").attr("id", "a")
    // .text("This paragraph is appended to <html> (the document root) because no selectAll statement reset the parent element.");

   

  }

}

},[svgRef.current, mergedObjects]) // Only re-run the effect if count changes

    // console.log('merged object after', mergedObjects);
    
    const refElement = useRef(null);

    // end
  
    return (
      <div className="Text">
        <div>
          <h3>Speech to text</h3>
          <AudioRecorder finishRecording={convertFromBuffer} />
          <p>{response}</p>
         
          {/* <svg ref={svgRef}  width="1640" height="1480"><g className="chart"></g></svg> */}

          <svg ref={svgRef} id="D3Return" />
        </div>
      </div>
    );
  }

 export default SpeechToText;