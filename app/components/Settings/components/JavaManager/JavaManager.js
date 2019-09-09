import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Icon, Tooltip, Input } from 'antd';
import { exec } from 'child_process';
import { promisify } from 'util';
import { useTranslation } from 'react-i18next';
import path from 'path';
import { connect, useDispatch, useSelector } from 'react-redux';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './JavaManager.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import { findJavaHome, checkJavaArch } from '../../../../utils/javaHelpers';
import store from '../../../../localStore';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import SettingInput from '../SettingInput/SettingInput';
import JavaMemorySlider from './javaMemorySlider';
import JavaArguments from './JavaArguments';
import { updateJavaArguments, updateJavaPath, updateJavaMemory } from '../../../../reducers/settings/actions';

function JavaManager(props) {
  const [is64bit, setIs64bit] = useState(true);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const javaPath = useSelector(state => state.settings.java.path);
  const javaMemory = useSelector(state => state.settings.java.memory);

  const checkJava = async () => {
    setIs64bit(checkJavaArch(javaP));
  };

  useEffect(() => {
    checkJava();
  }, []);

  const openFolderDialog = () => {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog(
      {
        properties: ['openFile'],
        defaultPath: path.dirname(javaPath)
      },
      paths => dispatch(updateJavaArguments(paths[0]))
    );
  };

  return (
    <div>
      <Title>{t('JavaManagerGlobal', 'Java Manager (Global)')}</Title>
      <SwitchSetting
        mainText={t('AutodetectJavaPath', 'Autodetect Java Path')}
        description={t('AutodetectJavaPathDescription', 'If enabled, java path will be autodetected')}
        icon="folder"
        checked={!javaPath}
        onChange={async c => dispatch(updateJavaPath(c, c ? null : await findJavaHome()))}
      />
      {!javaPath ? null : (
        <div>
          <span style={{ fontSize: 18 }}>{t('JavaCustomPath', 'Java Custom Path')}</span>
          <Input
            size="large"
            style={{
              width: '90%',
              display: 'inline-block',
              height: '60px',
              marginBottom: 10,
              marginTop: 4
            }}
            prefix={
              <Icon
                type="folder"
                theme="filled"
                style={{ color: 'rgba(255,255,255,.8)' }}
              />
            }
            placeholder={t('IfEmptyGameWontStart', '(If empty, the game won\'t start)')}
            onChange={e => dispatch(updateJavaPath(false, e.target.value))}
            value={javaPath}
          />
          <Button
            type="primary"
            icon="folder"
            theme="filled"
            onClick={() => openFolderDialog()}
            style={{ height: 60, marginLeft: 10 }}
          />
        </div>
      )}
      <JavaMemorySlider
        ram={javaMemory}
        is64bit={is64bit}
        updateMemory={v => dispatch(updateJavaMemory(v))}
      />
      <JavaArguments />
    </div>
  );
}

export default JavaManager;
