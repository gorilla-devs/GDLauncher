import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, message } from 'antd';
import fsa from 'fs-extra';
import path from 'path';
import styles from './Instances.scss';
import { INSTANCES_PATH } from '../../../../constants';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import ButtonSetting from '../ButtonSetting/ButtonSetting';

const deleteShareData = async () => {
  try {
    await fsa.emptyDir(INSTANCES_PATH);
    message.success("Data has been cleared.");
  } catch (e) {
    message.error('Error while clearing data.');
  }
};

const Instances = (props) => {
  return (
    <div>
      <Title>Instances</Title>
      <SettingCard>
        <ButtonSetting
          mainText="Clear Shared Data"
          description="Deletes all the shared files between instances. Doing this will result in the complete loss of the instances data"
          onClick={deleteShareData}
          btnText="Clear" />
      </SettingCard>
    </div>
  );
};

export default Instances;