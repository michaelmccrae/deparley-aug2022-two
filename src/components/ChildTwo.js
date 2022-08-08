import React, {useEffect} from 'react';

const ChildTwo = (props) => {
    useEffect(() => {
        
       
        console.log("Here's your props", props.dataParentToChild)
        
        
    }, [])
    return (
        <div>
            <h2>Stuff Child {props.dataParentToChild}</h2>
        </div>
    );
};

export default ChildTwo;