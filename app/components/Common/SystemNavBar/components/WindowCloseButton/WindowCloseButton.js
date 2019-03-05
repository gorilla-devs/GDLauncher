// @flow
import React, { Component } from 'react';
import { remote, app } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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
          <FontAwesomeIcon
            icon={faTimes}
            style={{ width: '15px', height: '15px' }}
          />
        </button>
      </div>
    );
  }
}
