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
        transform: 'scale(1.3)',
        opacity: 0,
        transition: 'all 200ms',
        willChange: 'transform',
        transitionTimingFunction: 'ease-in-out'
      },
      bgStyle: {
        background: 'rgba(0, 0, 0, 0)',
        transition: 'all 200ms ease-in-out'
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
        transform: 'scale(1.3)',
        opacity: 0,
        transition: 'all 200ms',
        willChange: 'transform',
        transitionTimingFunction: 'ease-in-out'
      },
      bgStyle: {
        background: 'rgba(0, 0, 0, 0)',
        transition: 'all 200ms ease-in-out'
      }
    });
  }

  mountStyle() { // css for mount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale(1)',
        opacity: 1,
        transition: 'all 200ms',
        willChange: 'transform',
        transitionTimingFunction: 'ease-in-out'
      },
      bgStyle: {
        background: 'rgba(0, 0, 0, 0.4)',
        transition: 'all 200ms ease-in-out'
      }
    });
  }

  back = e => {
    e.stopPropagation();
    setTimeout(this.unMountStyle, 10); // call the into animiation
    setTimeout(this.props.history.goBack, 200);
  };

  render() {
    return (
      <div className={styles.overlay} onClick={this.back} style={this.state.bgStyle}>
        <div className={styles.modal} style={this.state.style} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3 style={{ display: 'inline-block' }}>Modal</h3>
            <Button shape="circle" icon="close" size="large" className={styles.closeBtn} onClick={this.back} />
          </div>
          <div className={styles.modalContent}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
