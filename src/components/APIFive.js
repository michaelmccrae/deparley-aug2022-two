import React, {useEffect, useRef} from 'react';
//install just functionality for d3 and lodash when shipping
import * as d3 from 'd3';
import _ from 'lodash';

function APIFive() {
    
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

    return (
        <div>
        
        <p ref={svgRef} id="D3Return"></p>

        
        </div>
    );
}

export default APIFive;