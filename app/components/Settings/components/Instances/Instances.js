import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, message, Input, Icon } from 'antd';
import { useTranslation } from 'react-i18next';
import fsa from 'fs-extra';
import path from 'path';
import styles from './Instances.scss';
import {
  INSTANCES_PATH,
  META_PATH,
  DATAPATH,
  INSTANCES_FOLDER
} from '../../../../constants';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import ButtonSetting from '../ButtonSetting/ButtonSetting';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  updateJavaPath,
  updateInstancesPath
} from '../../../../reducers/settings/actions';

function Instances(props) {
  const [deletingInstances, setDeletingInstances] = useState(false);
  const { t } = useTranslation();
  const isInstalling = useSelector(
    state => state.loading.instanceDownload.isRequesting
  );
  const instancesPath = useSelector(
    state => state.settings.general.instancesPath
  );
  const dispatch = useDispatch();

  async function deleteShareData() {
    try {
      setDeletingInstances(true);
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'libraries'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'packs'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'assets'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'versions'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'temp'));
      await fsa.emptyDir(META_PATH);
      setDeletingInstances(false);
      message.success(t('DataHasBeenCleared', 'Data has been cleared.'));
    } catch (e) {
      message.error(t('ErrorClearingData', 'Error while clearing data.'));
    }
  }

  const openFolderDialog = () => {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog(
      {
        properties: ['openDirectory'],
        defaultPath: path.dirname(props.instancesPath)
      },
      paths => dispatch(updateJavaPath(paths[0]))
    );
  };

  const restartLauncher = () => {
    const remote = require('electron').remote;
    remote.app.relaunch();
    remote.app.exit(0);
  };

  return (
    <div>
      <Title>Instances</Title>
      <SettingCard>
        <ButtonSetting
          mainText={t('ClearAllData', 'Clear Shared Data')}
          description={t(
            'ClearAllDataDescription',
            'Deletes all the shared files between instances. Doing this will result in the complete loss of the instances data'
          )}
          icon={faTrash}
          onClick={() => deleteShareData()}
          disabled={isInstalling}
          loading={deletingInstances}
          btnText={t('Clear', 'Clear')}
        />
      </SettingCard>
      <SwitchSetting
        mainText={t(
          'OverrideDefaultInstancesPath',
          'Override Default Instances Path'
        )}
        description={
          <div>
            <div>
              {t(
                'OverrideDefaultInstancesPathDescription1',
                'If enabled, instances will be downloaded in the selected path'
              )}
            </div>
            <div className={styles.restart}>
              You need to{' '}
              <span
                style={{ color: 'white', cursor: 'pointer' }}
                onClick={restartLauncher}
              >
                restart
              </span>{' '}
              the launcher for this setting to apply
            </div>
          </div>
        }
        checked={instancesPath}
        icon={faFolder}
        onChange={e => props.setInstancesPath(e ? INSTANCES_PATH : null)}
      />
      {instancesPath && (
        <div>
          <div>
            <span style={{ fontSize: 18 }}>
              {t('InstancesCustomPath', 'Instances Custom Path')}{' '}
            </span>
            <a
              onClick={() =>
                dispatch(
                  updateInstancesPath(path.join(DATAPATH, INSTANCES_FOLDER))
                )
              }
              style={{ fontSize: 13 }}
            >
              {t('ResetPath', 'Reset Path')}
            </a>
            <Input
              value={instancesPath}
              size="large"
              style={{
                width: '90%',
                display: 'inline-block',
                height: '60px',
                marginBottom: '10px !important',
                marginTop: '4px !important'
              }}
              prefix={<FontAwesomeIcon icon={faFolder} />}
              onChange={e => dispatch(updateInstancesPath(e.target.value))}
            />
            <Button
              type="primary"
              // icon="folder"
              theme="filled"
              onClick={openFolderDialog}
              style={{
                height: 60,
                marginLeft: 10,
                marginBottom: 10,
                marginTop: 4,
                padding: 8
              }}
            >
              <FontAwesomeIcon icon={faFolder} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Instances;
