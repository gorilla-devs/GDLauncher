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
      message.success("Data has been cleared.");
    } catch (e) {
      message.error('Error while clearing data.');
    }
  };

  render() {
    return (
      <div>
        <Title>Instances</Title>
        <SettingCard>
          <ButtonSetting
            mainText="Clear Shared Data"
            description="Deletes all the shared files between instances. Doing this will result in the complete loss of the instances data"
            icon="delete"
            onClick={this.deleteShareData}
            disabled={this.props.installing !== null}
            loading={this.state.deletingInstances}
            btnText="Clear" />
        </SettingCard>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    installing: state.downloadManager.actualDownload,
  };
}


export default connect(mapStateToProps)(Instances);
