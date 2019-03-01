import React, { useState } from 'react';
import { Icon, Slider, Tooltip, Input, Button } from 'antd';
import os from 'os';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './JavaArguments.scss';
import Constants from '../../../../constants';

function javaMemorySlider(props) {
  const { mainText, icon, description, updateMemory, ram } = props;
  const [memory, setMemory] = useState(ram);



  return (
    <div>
      <div className={styles.form}>
        <Input/>
        <Button type="primary" value="" className={styles.button}>Set</Button>
      </div>
      <hr />
    </div>
  );
}

export default javaMemorySlider;
