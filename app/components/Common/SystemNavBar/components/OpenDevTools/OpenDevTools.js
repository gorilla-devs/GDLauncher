// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import styles from './OpenDevTools.css';

type Props = {};
export default class WindowCloseButton extends Component<Props> {
  props: Props;

  OpenDevTools = () => {
    ipcRenderer.send('open-devTools');
  };

  render() {
    return (
      <div>
        <button className={styles.OpenDevTools} onClick={this.OpenDevTools}>
          <i className="fas fa-terminal" style={{ width: '15px', height: '15px' }} />
        </button>
      </div>
    );
  }
}
