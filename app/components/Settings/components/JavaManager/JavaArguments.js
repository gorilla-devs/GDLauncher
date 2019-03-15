import React, { useState, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import store from '../../../../localStore';
import { setArgs } from '../../../../actions/settings';
import { DEFAULT_ARGS } from '../../../../constants';

type Props = {
  setArgs: () => void
};

function JavaArguments(props: Props) {
  const [globalArgs, setGlobalArgsInput] = useState(null);

  const updateJavaArguments = javaArguments => {
    setGlobalArgsInput(javaArguments);
    props.setArgs(javaArguments);
  };

  // Store is red if it exists and if it doesn't it's created, read and set to the redux store to be read by the instances launcher (utils/MCLaunchCommand)
  async function readStoreJavaArgs() {
    const storeJavaArguments = store.get('settings.java.javaArg');
    updateJavaArguments(storeJavaArguments);
  }

  useEffect(() => {
    readStoreJavaArgs();
  }, []);

  // Set the changed java arguments
  async function submit() {
    props.setArgs(globalArgs);
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

const mapDispatchToProps = {
  setArgs
};

export default connect(
  null,
  mapDispatchToProps
)(JavaArguments);
