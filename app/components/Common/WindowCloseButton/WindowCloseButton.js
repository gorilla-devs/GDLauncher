// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './WindowCloseButton.css';

type Props = {};
export default class WindowCloseButton extends Component<Props> {
  props: Props;

  closeWindow = () => {
    const w = remote.getCurrentWindow();
    w.close();
  };

  render() {
    return (
      <div>
        <button className={styles.CloseBtn} onClick={this.closeWindow}>
          <i className="fas fa-times" style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
    );
  }
}
