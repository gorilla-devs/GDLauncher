// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './WindowHideButton.css';

type Props = {};
export default class WindowHideButton extends Component<Props> {
  props: Props;

  MinMaxWindow = () => {
    const w = remote.getCurrentWindow();
    w.minimize();
  };

  render() {
    return (
      <div>
        <button className={styles.CloseBtn} onClick={this.MinMaxWindow}>
          <i className="fas fa-window-minimize" style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
    );
  }
}
