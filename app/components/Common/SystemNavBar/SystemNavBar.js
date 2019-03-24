// @flow
import React, { Component } from 'react';
import styles from './SystemNavBar.scss';
import WindowCloseBtn from './components/WindowCloseButton/WindowCloseButton';
import WindowMinimizeBtn from './components/WindowMinimizeButton/WindowMinimizeButton';
import WindowHideBtn from './components/WindowHideButton/WindowHideButton';
import OpenDevTools from './components/OpenDevTools/OpenDevTools';

type Props = {};
export default class SystemNavBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <OpenDevTools />
        <WindowCloseBtn />
        <WindowMinimizeBtn />
        <WindowHideBtn />
      </div>
    );
  }
}
