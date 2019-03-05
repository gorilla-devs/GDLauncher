// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal } from '@fortawesome/free-solid-svg-icons';
import styles from './OpenDevTools.scss';

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
          <FontAwesomeIcon
            icon={faTerminal}
            style={{ width: '15px', height: '15px' }}
          />
        </button>
      </div>
    );
  }
}
