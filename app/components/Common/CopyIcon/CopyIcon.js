// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tooltip } from 'antd';
import { clipboard } from 'electron';
import styles from './CopyIcon.scss';
import { playCopySound } from '../../../utils/sounds';

type Props = {
  text: string
};

class CopyIcon extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
  }

  copy = () => {
    this.setState({ copied: true });
    clipboard.writeText(this.props.text);
    if (this.props.soundsEnabled) {
      playCopySound();
    }
    setTimeout(() => {
      this.setState({ copied: false });
    }, 600);
  };

  render() {
    return (
      <Tooltip
        title={this.state.copied ? 'Copied' : 'Copy'}
        mouseLeaveDelay={this.state.copied ? 0.3 : 0.1}
      >
        <Icon
          className={styles.copyBtn}
          type="copy"
          theme="filled"
          onClick={this.copy}
        />
      </Tooltip>
    );
  }
}

function mapStateToProps(state) {
  return {
    soundsEnabled: state.settings.sounds
  };
}

export default connect(mapStateToProps)(CopyIcon);
