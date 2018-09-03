
// @flow
import React, { Component } from 'react';
import { Button, Icon, Tooltip } from 'antd';
import { clipboard } from 'electron';
import styles from './CopyIcon.scss';
import { playCopySound } from '../../../utils/sounds';

type Props = {
  text: string
};

export default class CopyIcon extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    }
  }

  copy = () => {
    this.setState({ copied: true });
    clipboard.writeText(this.props.text);
    playCopySound();
    setTimeout(() => {
      this.setState({ copied: false });
    }, 600);
  }

  render() {
    return (
      <Tooltip title={this.state.copied ? 'Copied' : 'Copy'} mouseLeaveDelay={this.state.copied ? 0.3 : 0.1} >
        <Icon className={styles.copyBtn} type="copy" onClick={this.copy} />
      </Tooltip>
    );
  }
}
