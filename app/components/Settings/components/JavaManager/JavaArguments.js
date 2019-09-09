import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT_JAVA_ARGUMENTS } from '../../../../constants';
import JavaArgsInput from '../../../Common/JavaArgumentInput';
import { updateJavaArguments } from '../../../../reducers/settings/actions';

type Props = {
  javaArgs: string
};

function JavaArguments(props: Props) {
  const javaArgs = useSelector(state => state.settings.java.arguments);
  const [globalArgs, setGlobalArgsInput] = useState(javaArgs);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Reset the global arguments to the default one
  function resetJavaArguments() {
    dispatch(updateJavaArguments(DEFAULT_JAVA_ARGUMENTS));
    setGlobalArgsInput(DEFAULT_JAVA_ARGUMENTS);
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{t('JavaCustomArguments', 'Java Custom Arguments')}</span>
      </div>
      <JavaArgsInput
        overrideArgs={globalArgs}
        onChange={setGlobalArgsInput}
        updateArgs={args => dispatch(updateJavaArguments(args))}
        resetArgs={resetJavaArguments}
      />
      <hr />
    </div>
  );
}

export default JavaArguments;
