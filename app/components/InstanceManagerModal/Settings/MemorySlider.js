import React from 'react';
import JavaMemorySlider from '../../Settings/components/JavaManager/javaMemorySlider';

function MemorySlider(props) {
  const {memory, hr, overrideJava, ram, is64bit, updateMemory, javaArguments, instanceName} = props;

  return (
    <React.Fragment>
      {memory && (
        <JavaMemorySlider
          hr={hr}
          overrideJava={overrideJava}
          ram={ram}
          is64bit={is64bit}
          updateMemory={updateMemory}
          javaArguments={javaArguments}
          instanceName={instanceName}
        />
      )}
    </React.Fragment>
  );
}

export default MemorySlider;
