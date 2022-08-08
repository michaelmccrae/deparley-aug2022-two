import React, {useEffect} from 'react';

const ChildD3Jul = (props) => {
    
    //props.Resulting()

    useEffect(() => { 
       
        console.log("UseEffect your props", props.mergedObjects)
        
    }, [props.mergedObjects])


    return (
        <div>
            <h2>Stuff Child GGG {props.mergedObjects}</h2>
        </div>
    );
};

export default ChildD3Jul;