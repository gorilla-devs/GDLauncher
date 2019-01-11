// @flow
import React, { Component } from 'react';
import { remote, app } from 'electron';
import styles from './WindowCloseButton.scss';

type Props = {};
export default class WindowCloseButton extends Component<Props> {
  props: Props;

  closeWindow = () => {
    remote.app.quit();
  };

  render() {
    return (
      <div>
        <button className={styles.CloseBtn} onClick={this.closeWindow}>
          <i className="fas fa-times" style={{ width: '15px', height: '15px' }} />
        </button>
      </div>
    );
  }
}
