import React, { useState } from 'react';
import { Icon, Slider, Tooltip } from 'antd';
import os from 'os';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './javaMemorySlider.scss';

function javaMemorySlider(props) {
  const { mainText, icon, description, updateMemory, ram } = props;
  const [memory, setMemory] = useState(ram);

  const marks = {
    2048: '2048',
    4096: '4096',
    8192: '8192',
    16384: '16384'
  };

  return (
    <div>
      <div className={styles.container}>
        <div>
          <div className={styles.mainText}>
            Java Memory (
            {props.is64bit ? (
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
          </div>
          <div className={styles.description}>{description}</div>
        </div>
        <div className={styles.action}>{memory} MB</div>
      </div>
      <Slider
        marks={marks}
        step={512}
        min={1024}
        max={
          // If 32 bit, set max 1.5gb memory
          // https://developer.ibm.com/answers/questions/175172/why-can-i-not-set-a-maximum-heap-setting-xmx-over/
          props.is64bit ? os.totalmem() / 1000000 : 1536
        }
        // defaultValue={ram}
        defaultValue={memory}
        onChange={v => setMemory(v)}
        onAfterChange={v => updateMemory(v)}
      />
      <hr />
    </div>
  );
}

export default javaMemorySlider;
