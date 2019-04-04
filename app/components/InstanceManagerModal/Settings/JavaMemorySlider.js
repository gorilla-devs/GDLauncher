import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Icon, Slider, Tooltip, Switch } from 'antd';
import os from 'os';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { promisify } from 'util';
import { func } from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './JavaMemorySlider.scss';
import { toggleOverrideJavaArguments } from '../../../actions/settings';
import { PACKS_PATH } from '../../../constants';

function JavaMemorySlider(props) {
  const {
    mainText,
    icon,
    description,
    updateMemory,
    ram,
    is64bit,
    toggleOverrideJavaArguments
  } = props;
  // const [overrideJavaMemory, setOverrideJavaMemory] = useState(ram);
  const [memory, setMemory] = useState(null);
  const [switchState, setSwitchState] = useState(false);

  const marks = {
    2048: '2048',
    4096: '4096',
    8192: '8192',
    16384: '16384'
  };

  const checkSwitchState = async () => {
    const configFile = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, props.instanceName, 'config.json')
      )
    );
    if (configFile.overrideMemory) {
      setSwitchState(true);
      setMemory(configFile.overrideMemory);
    } else setSwitchState(false);
  };

  useEffect(() => {
    checkSwitchState();
  });

  async function toggleJavaMemory(e) {
    try {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      if (config.overrideMemory === undefined && e) {
        const modifiedConfig = JSON.stringify({
          ...config,
          overrideMemory: 4096
        });
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        const configChanged = JSON.parse(
          await promisify(fs.readFile)(
            path.join(PACKS_PATH, props.instanceName, 'config.json')
          )
        );
        // setMemory(configChanged.overrideMemory);
        setSwitchState(true);
      } else if (config.overrideMemory !== undefined && !e) {
        const modifiedConfig = JSON.stringify(_.omit(config, 'overrideMemory'));
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setSwitchState(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const memorySlider = (
    <div>
      <div className={styles.mainText}>{memory} MB</div>
      {memory && (
        <Slider
          marks={marks}
          step={512}
          min={1024}
          max={
            // If 32 bit, set max 1.5gb memory
            // https://developer.ibm.com/answers/questions/175172/why-can-i-not-set-a-maximum-heap-setting-xmx-over/
            is64bit ? os.totalmem() / 1000000 : 1536
          }
          defaultValue={memory}
          onChange={v => setMemory(v)}
          onAfterChange={v => updateMemory(v)}
        />
      )}
    </div>
  );

  return (
    <div>
      <div className={styles.mainText}>
        Java Memory (
        {is64bit ? (
          '64 bit)'
        ) : (
          <span>
            32 bit)&nbsp;
            <Tooltip
              placement="right"
              title="Your system uses a 32 bit Java, which allows a maximum of 1.5GB to be used.
                  If you want more, install or select a 64 bit java executable"
            >
              <FontAwesomeIcon
                className={styles.iconPointer}
                icon={faQuestionCircle}
              />
            </Tooltip>
          </span>
        )}
        <Switch
          className={styles.switch}
          onChange={e => toggleJavaArguments(e)}
          checked={switchState}
        />
      </div>
      {switchState ? memorySlider : null}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
    javaArgs: state.settings.java.javaArgs,
    overrideMemory: state.settings.java.overrideMemory
  };
}

const mapDispatchToProps = {
  toggleOverrideJavaArguments
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaMemorySlider);
