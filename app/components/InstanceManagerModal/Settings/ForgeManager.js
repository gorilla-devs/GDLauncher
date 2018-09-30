import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Select, Form, Input, Icon, Button, Checkbox } from 'antd';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import fsa from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import log from 'electron-log';
import Card from '../../Common/Card/Card';
import { PACKS_PATH } from '../../../constants';
import colors from '../../../style/theme/colors.scss';

const FormItem = Form.Item;
type Props = {};

class Instances extends Component<Props> {
  props: Props;

  render() {
    if (this.props.data.forgeVersion === null) {
      return (
        <div style={{ textAlign: 'center', color: colors.red }}>
          Forge is not installed
        </div >
      )
    }
    return (
      <div style={{ textAlign: 'center', color: colors.green }}>
        Forge is installed: {this.props.data.forgeVersion} <br />
        <Button type="primary" style={{ marginTop: 10 }}>Remove Forge</Button>
    </div >
    )
  }
}

function mapStateToProps(state) {
  return {};
}


export default connect(mapStateToProps)(Instances);
