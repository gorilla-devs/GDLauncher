import React, { useState, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import store from '../../../../localStore';
import { setJavaArgs } from '../../../../actions/settings';
import { DEFAULT_ARGS } from '../../../../constants';

type Props = {
  setJavaArgs: () => void,
  javaArgs: string
};

function JavaArguments(props: Props) {
  const { javaArgs } = props;
  const [globalArgs, setGlobalArgsInput] = useState(javaArgs);

  const updateJavaArguments = javaArguments => {
    setGlobalArgsInput(javaArguments);
    props.setJavaArgs(javaArguments);
  };

  // Set the changed java arguments
  function submit() {
    props.setJavaArgs(globalArgs);
    if (globalArgs) {
      updateJavaArguments(globalArgs);
    } else message.error('Enter Valid Arguments');
  }

  // Reset the global arguments to the defalut one
  function reset() {
    updateJavaArguments(DEFAULT_ARGS);
  }

  return (
    <div>
      <div style={{ display: 'inline' }}>
        <Input
          value={globalArgs}
          style={{
            maxWidth: '80%',
            marginRight: '10px'
          }}
          onChange={e => setGlobalArgsInput(e.target.value)}
        />
        <Button.Group>
          <Button type="primary" onClick={() => submit()}>
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button type="primary" onClick={() => reset()}>
            <FontAwesomeIcon icon={faUndo} />
          </Button>
        </Button.Group>
      </div>
      <hr />
    </div>
  );
}

const mapStateToProps = state => {
  return {
    javaArgs: state.settings.java.javaArgs
  };
};

const mapDispatchToProps = {
  setJavaArgs
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaArguments);
