import React, {useEffect} from 'react';

const Child = (props) => {
    
    //props.Resulting()

    useEffect(() => { 
       
        console.log("UseEffect your props", props.Resulting)
        
    }, [props.Resulting])


    return (
        <div>
            <h2>Stuff Child {props.Resulting}</h2>
        </div>
    );
};

export default Child;