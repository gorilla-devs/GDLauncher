// @flow
import React, { Component } from 'react';
import { message, Form, Input, Icon, Button, Cascader } from 'antd';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import vSort from 'version-sort';
import _ from 'lodash';
import { PACKS_PATH } from '../../constants';
import Modal from '../Common/Modal/Modal';
import axios from 'axios';
import downloadFile from '../../utils/downloader'

type Props = {};

axios.get 

class ServerCreatorModal extends Component<Props> {
  
  render() {

    return (
      <Modal
        history={this.props.history}
        
        title="Create New Instance"
        style={{ height: '80vh' }}
      >
       PEPPE PEPPINO
      </Modal>
    );
  }
}

export default Form.create()(ServerCreatorModal);