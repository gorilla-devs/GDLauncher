import React, { useState } from 'react';
import { Icon, Slider } from 'antd';
import styles from './JavaMemorySlider.scss';

function javaMemorySlider(props) {
  const { mainText, icon, description, updateMemory, ram } = props;
  const [memory, setMemory] = useState(ram);

  const marks = {
    2048: '2048',
    4096: '4096',
    8192: '8192',
    16384: '16384',
  };

  return (
    <div>
      <div className={styles.container}>
        <div>
          <div className={styles.mainText}>Java Memory <Icon type={icon || "robot"} theme="filled" /></div>
          <div className={styles.description}>{description}</div>
        </div>
        <div className={styles.action}>
          {memory} MB
        </div>
      </div>
      <Slider
        marks={marks}
        step={512}
        min={1024}
        max={16384}
        defaultValue={ram}
        onChange={v => setMemory(v)}
        onAfterChange={v => updateMemory(v)}
      />
      <hr />
    </div>
  );
}

export default javaMemorySlider;
