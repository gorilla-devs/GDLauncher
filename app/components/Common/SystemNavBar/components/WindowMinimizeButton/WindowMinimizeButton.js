// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './WindowMinimizeButton.scss';

type Props = {};
export default class WindowMinimizeButton extends Component<Props> {
  props: Props;

  MinMaxWindow = () => {
    const w = remote.getCurrentWindow();
    if (w.isMaximized()) {
      w.unmaximize();
    } else if (w.isMaximizable()) {
      w.maximize();
    }
  };

  render() {
    return (
      <div>
        <button className={styles.CloseBtn} onClick={this.MinMaxWindow}>
          <i className="far fa-window-maximize" style={{ width: '15px', height: '15px' }} />
        </button>
      </div>
    );
  }
}
