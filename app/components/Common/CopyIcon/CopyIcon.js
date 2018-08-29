
// @flow
import React, { Component } from 'react';
import { Button, Icon, Tooltip } from 'antd';
import { clipboard } from 'electron';
import styles from './CopyIcon.scss';

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
    const audio = new Audio('./copy.wav');
    audio.play();
    setTimeout(() => {
      this.setState({ copied: false });
    }, 1000);
  }

  render() {
    return (
      <Tooltip title={this.state.copied ? 'Copied' : 'Copy'} mouseLeaveDelay={this.state.copied ? 0.5 : 0.1} >
        <Icon className={styles.copyBtn} type="copy" onClick={this.copy} />
      </Tooltip>
    );
  }
}
