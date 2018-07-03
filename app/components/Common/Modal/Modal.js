import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Modal.css';

export default class Modal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.mountStyle = this.mountStyle.bind(this);
    this.unMountStyle = this.unMountStyle.bind(this);
    this.state = { // base css
      style: {
        display: 'block',
        transform: 'scale3d(0, 1, 1)',
        transition: 'all 300ms',
        willChange: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0, 1.5)'
      }
    };
  }

  componentDidMount() {
    setTimeout(this.mountStyle, 10); // call the into animiation
  }

  componentWillReceiveProps(newProps) { // check for the mounted props
    if (!newProps.mounted) {
      return this.unMountStyle(); // call outro animation when mounted prop is false
    }
    setTimeout(this.mountStyle, 10); // call the into animiation
  }

  unMountStyle() { // css for unmount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale3d(0, 1, 0.1)',
        transition: 'all 180ms',
        willChange: 'transform',
        transitionTimingFunction: 'cubic-bezier(.62,.28,.23,.99) 0.7s'
      }
    })
  }

  mountStyle() { // css for mount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale3d(1, 1, 1)',
        transition: 'all 300ms',
        willChange: 'transform',
        transitionTimingFunction: 'cubic-bezier(.62,.28,.23,.99) 0.7s'
      }
    })
  }

  back = e => {
    e.stopPropagation();
    setTimeout(this.unMountStyle, 10); // call the into animiation
    setTimeout(this.props.history.goBack, 160);
  };

  render() {
    return (
      <div className={styles.overlay} onClick={this.back}>
        <div className={styles.modal} style={this.state.style} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ display: 'inline-block' }}>Settings</h3>
          <Button shape="circle" icon="close" size="large" className={styles.closeBtn} onClick={this.back} />
          <div className={styles.modalContent}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
