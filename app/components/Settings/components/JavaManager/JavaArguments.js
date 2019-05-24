import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { setJavaArgs } from '../../../../actions/settings';
import { DEFAULT_ARGS } from '../../../../constants';
import JavaArgsInput from '../../../Common/JavaArgumentInput';

type Props = {
  setJavaArgs: () => void,
  javaArgs: string
};

function JavaArguments(props: Props) {
  const { javaArgs } = props;
  const [globalArgs, setGlobalArgsInput] = useState(javaArgs);
  const { t } = useTranslation();

  const updateJavaArguments = javaArguments => {
    props.setJavaArgs(javaArguments);
  };

  // Reset the global arguments to the default one
  function resetJavaArguments() {
    props.setJavaArgs(DEFAULT_ARGS);
    setGlobalArgsInput(DEFAULT_ARGS);
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{t('JavaCustomArguments', 'Java Custom Arguments')}</span>
      </div>
      <JavaArgsInput
        overrideArgs={globalArgs}
        onChange={setGlobalArgsInput}
        updateArgs={updateJavaArguments}
        resetArgs={resetJavaArguments}
      />
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
