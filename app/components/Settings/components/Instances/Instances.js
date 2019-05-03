import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, message } from 'antd';
import fsa from 'fs-extra';
import path from 'path';
import styles from './Instances.scss';
import { INSTANCES_PATH, META_PATH } from '../../../../constants';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import ButtonSetting from '../ButtonSetting/ButtonSetting';
import { setInstancesPath } from '../../../../actions/settings';
import { readFile } from '../../../../utils/instances';
import store from '../../../../localStore';
import { func } from 'prop-types';

type Props = {};

class Instances extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      deletingInstances: false
    };
  }

  deleteShareData = async () => {
    try {
      this.setState({ deletingInstances: true });
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'libraries'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'packs'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'assets'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'versions'));
      await fsa.emptyDir(path.join(INSTANCES_PATH, 'temp'));
      await fsa.emptyDir(META_PATH);
      this.setState({ deletingInstances: false });
      message.success('Data has been cleared.');
    } catch (e) {
      message.error('Error while clearing data.');
    }
  }

  const openFolderDialog = () => {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog(
      {
        properties: ['openDirectory'],
        defaultPath: path.dirname(props.instancesPath)
      },
      paths => {
        props.setInstancesPath(paths[0]);
      }
    );
  };

  return (
    <div>
      <Title>Instances</Title>
      <SettingCard>
        <ButtonSetting
          mainText="Clear Shared Data"
          description="Deletes all the shared files between instances. Doing this will result in the complete loss of the instances data"
          icon="delete"
          onClick={() => deleteShareData()}
          disabled={props.installing !== null}
          loading={deletingInstances}
          btnText="Clear"
        />
      </SettingCard>
      <SwitchSetting
        mainText="Override Default Instances Path"
        description="If enabled, instances will be downloaded in the selected path"
        icon="folder"
        checked={props.instancesPath}
        onChange={e => props.setInstancesPath(e ? INSTANCES_PATH : null)}
      />
      {props.instancesPath && (
        <div>
          <span style={{ fontSize: 18 }}>Instances Custom Path</span>
          <Input
            value={props.instancesPath}
            size="large"
            style={{
              width: '90%',
              display: 'inline-block',
              height: '60px',
              marginBottom: '10px !important',
              marginTop: '4px !important'
            }}
            prefix={
              <Icon
                type="folder"
                theme="filled"
                style={{ color: 'rgba(255,255,255,.8)' }}
              />
            }
            onChange={e => props.setInstancesPath(e.target.value)}
          />
          <Button
            type="primary"
            icon="folder"
            theme="filled"
            onClick={openFolderDialog}
            style={{ height: 60, marginLeft: 10, marginBottom: 10, marginTop: 4  }}
          />
        </div>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    installing: state.downloadManager.actualDownload
  };
}

const mapDispatchToProps = {
  setInstancesPath
};
