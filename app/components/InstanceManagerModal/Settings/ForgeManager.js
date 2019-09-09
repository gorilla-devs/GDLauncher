import React, { Component, useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Tooltip, Select, message, Switch } from 'antd';
import path from 'path';
import {promises as fs} from 'fs';
import _ from 'lodash';
import makeDir from 'make-dir';
import { downloadFile } from '../../../utils/downloader';
import {
  PACKS_PATH,
  GDL_COMPANION_MOD_URL,
  GDL_LEGACYJAVAFIXER_MOD_URL
} from '../../../constants';
import vCompare from '../../../utils/versionsCompare';
import colors from '../../../style/theme/colors.scss';
import styles from './ForgeManager.scss';
import { instanceDownloadOverride } from '../../../reducers/actions';

const Instances = props => {
  const [forgeSelectVersion, setForgeSelectVersion] = useState(null);
  const [loadingCompanionDownload, setLoadingCompanionDownload] = useState(false);
  const [companionModState, setCompanionModState] = useState(false);
  const [legacyJavaFixerState, setLegacyJavaFixerState] = useState(false);
  const [loadingLJFDownload, setLoadingLJFDownload] = useState(false);

  const dispatch = useDispatch();

  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  

  useEffect(() => {
      fs.access(
        path.join(PACKS_PATH, props.name, 'mods', 'GDLCompanion.jar')
      ).then(() => setCompanionModState(true)).catch(() => {});
      
      fs.access(
        path.join(PACKS_PATH, props.name, 'mods', 'LJF.jar')
      ).then(() => legacyJavaFixerState(true)).catch(() => {});
  });

  const removeForge = async () => {
    const config = JSON.parse(
      await fs.readFile(
        path.join(PACKS_PATH, props.name, 'config.json')
      )
    );
    await fs.writeFile(
      path.join(PACKS_PATH, props.name, 'config.json'),
      JSON.stringify({ ...config, forgeVersion: null })
    );
  };

  const installForge = () => {
    if (!forgeSelectVersion) {
      message.warning('You need to select a version.');
    } else {
      dispatch(instanceDownloadOverride(
        props.data.version,
        props.name,
        forgeSelectVersion
      ));
      props.closeModal();
    }
  };

  const companionModSwitchChange = async value => {
    setLoadingCompanionDownload(true);
    if (value) {
      await makeDir(path.join(PACKS_PATH, props.name, 'mods'));
      await downloadFile(
        path.join(PACKS_PATH, props.name, 'mods', 'GDLCompanion.jar'),
        GDL_COMPANION_MOD_URL,
        () => {}
      );
      setCompanionModState(true);
    } else {
      await fs.unlink(
        path.join(PACKS_PATH, props.name, 'mods', 'GDLCompanion.jar')
      );
      setCompanionModState(false);
    }
    setLoadingCompanionDownload(false);
  };

  const legacyJavaFixerModSwitchChange = async value => {
    setLoadingLJFDownload(true);
    if (value) {
      await makeDir(path.join(PACKS_PATH, props.name, 'mods'));
      await downloadFile(
        path.join(PACKS_PATH, props.name, 'mods', 'LJF.jar'),
        GDL_LEGACYJAVAFIXER_MOD_URL,
        () => {}
      );
      setLegacyJavaFixerState(true);
    } else {
      await fs.unlink(
        path.join(PACKS_PATH, props.name, 'mods', 'LJF.jar')
      );
      setLegacyJavaFixerState(false);
    }
    setLoadingLJFDownload(false);
  };

    if (!props.data.forgeVersion) {
      return (
        <div style={{ textAlign: 'center', color: colors.red }}>
          Forge is not installed <br />
          <Select
            style={{ width: '140px' }}
            placeholder="Select a version"
            notFoundContent="No version found"
            onChange={setForgeSelectVersion}
          >
            {forgeManifest[props.data.version] &&
              _.reverse(
                forgeManifest[props.data.version].slice()
              ).map(ver => (
                <Select.Option key={ver} value={ver}>
                  {ver}
                </Select.Option>
              ))}
          </Select>
          <br />
          <Button
            type="primary"
            onClick={installForge}
            style={{ marginTop: 10 }}
          >
            Install Forge
          </Button>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          textAlign: 'center'
        }}
      >
        <div style={{ color: colors.green }}>
          {props.data.forgeVersion} <br />
          <Button
            type="primary"
            onClick={removeForge}
            style={{ marginTop: 10 }}
          >
            Remove Forge
          </Button>
        </div>
        <div>
          <div>
            Companion Mod{' '}
            <Tooltip
              title="The Companion Mod is an optional feature that allows us to keep track of actions happening in the game.
            This way we can create more precise stats on the instance."
            >
              <Icon
                type="info-circle"
                theme="filled"
                className={styles.companionModInfo}
              />
            </Tooltip>
            <br />
            <Switch
              onChange={companionModSwitchChange}
              checked={companionModState}
              loading={loadingCompanionDownload}
              style={{ marginTop: 10 }}
            />
          </div>
          {vCompare(
            props.data.forgeVersion.includes('-')
              ? props.data.forgeVersion.split('-')[1]
              : props.data.forgeVersion,
            '10.13.1.1217'
          ) === -1 && (
            <div style={{ marginTop: 15 }}>
              Java Legacy Fixer{' '}
              <Tooltip title="This is a mod to fix compatibility issues between old versions of forge and newest versions of Java.">
                <Icon
                  type="info-circle"
                  theme="filled"
                  className={styles.companionModInfo}
                />
              </Tooltip>
              <br />
              <Switch
                onChange={legacyJavaFixerModSwitchChange}
                checked={legacyJavaFixerState}
                loading={loadingLJFDownload}
                style={{ marginTop: 10 }}
              />
            </div>
          )}
        </div>
      </div>
    );
}
export default Instances;
