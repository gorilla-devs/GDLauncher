// @flow
import React, { Component } from 'react';
import { Button, Icon, Progress } from 'antd';
import Draggable from 'react-draggable';
import styles from './DIcon.css';
import launchCommand from '../../utils/MCLaunchCommand';

type Props = {
  name: string,
  installing: boolean,
  percentage: number
};
const classes = `${styles.icon__text} handle`

export default class DIcon extends Component<Props> {
  props: Props;

  handleClickPlay = async () => {
    /* const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const name = await exec(launchCommand()); */
    launchCommand();
  }
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
            {!this.props.installing &&
              <div>
                <div className={styles.icon__up} onClick={this.handleClickPlay}>
                  <span><Icon type="play-circle" /></span>
                </div>
                <div className={styles.icon__right}>
                  <span><Icon type="appstore" /></span>
                </div>
                <div className={styles.icon__bottom}>
                  <span><Icon type="appstore" /></span>
                </div>
                <div className={styles.icon__left}>
                  <span><Icon type="appstore" /></span>
                </div>
              </div>}
            {this.props.installing &&
              <div className={styles.icon__installing}>
                <Progress type="circle" percent={this.props.percentage} width={80} />
              </div>}
            <div
              className={styles.icon__image}
              style={{ filter: this.props.installing ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\'/></filter></svg>#grayscale")' : '' }}
            />
          </div>
          <div className={classes}>
            {this.props.name}
          </div>
        </div>
      </Draggable>
    );
  }
}
