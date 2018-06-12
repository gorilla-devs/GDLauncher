// @flow
import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import Draggable from 'react-draggable';
import styles from './DIcon.css';

type Props = {
  name: string
};
const classes = `${styles.icon__text} handle`

export default class DIcon extends Component<Props> {
  props: Props;
  render() {
    return (
      <Draggable
        axis="both"
        handle=".handle"
        defaultPosition={{ x: 0, y: 0 }}
        position={null}
        bounds="parent"
        grid={[1, 1]}
        onStart={this.handleStart}
        onDrag={(this.handleDrag)}
        onStop={this.handleStop}
      >
        <div className={styles.icon}>
          <div className={styles.icon__upContainer}>
            <div className={styles.icon__up}>
              <span><Icon type="play-circle" /></span>
            </div>
            <div className={styles.icon__right}>
              <span><Icon type="appstore" /></span>
            </div>
            <div className={styles.icon__bottom}>
              <span><Icon type="appstore" /></span>
            </div>
            <div className={styles.icon__image} />
          </div>
          <div className={classes}>
            {this.props.name}
          </div>
        </div>
      </Draggable>
    );
  }
}
