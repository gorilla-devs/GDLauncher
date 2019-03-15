import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
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

  // Reset the global arguments to the default one
  function reset() {
    updateJavaArguments(DEFAULT_ARGS);
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>Java Custom Path</span>
      </div>
      <div style={{ display: 'inline', verticalAlign: 'middle' }}>
        <Input
          value={globalArgs}
          style={{
            display: 'inline-block',
            maxWidth: '80%',
            marginRight: '10px',
            marginBottom: 10,
            marginTop: 4
          }}
          onChange={e => setGlobalArgsInput(e.target.value)}
        />
        <Button.Group
          style={{
            maxWidth: '70%',
            marginBottom: 10,
            marginTop: 4
          }}
        >
          <Button
            style={{
              maxWidth: '70%',
              marginBottom: 10,
              marginTop: 4
            }}
            type="primary"
            onClick={() => submit()}
          >
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button
            style={{
              maxWidth: '70%',
              marginBottom: 10,
              marginTop: 4
            }}
            type="primary"
            onClick={() => reset()}
          >
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
