// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './WindowHideButton.scss';

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
          <i className="far fa-window-minimize" style={{ width: '15px', height: '15px', position: 'relative', bottom: '5px' }} />
        </button>
      </div>
    );
  }
}
