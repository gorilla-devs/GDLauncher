import React from 'react';
import JavaMemorySlider from '../../Settings/components/JavaManager/javaMemorySlider';

function MemorySlider(props) {
  return (
    <React.Fragment>
      {props.memory && (
        <JavaMemorySlider
          hr={props.hr}
          overrideJava={props.overrideJava}
          ram={props.ram}
          is64bit={props.is64bit}
          updateMemory={props.updateMemory}
          javaArguments={props.javaArguments}
          instanceName={props.instanceName}
        />
      )}
    </React.Fragment>
  );
}

export default MemorySlider;
