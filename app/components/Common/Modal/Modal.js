// @flow
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import styles from './Modal.scss';

type Props = {
  history: any,
  style: {},
  header: boolean,
  title: string,
  backBtn: React.ReactNode,
  children: React.ReactNode
};

export default class Modal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.mountStyle = this.mountStyle.bind(this);
    this.unMountStyle = this.unMountStyle.bind(this);
    this.state = {
      // base css
      style: {
        display: 'block',
        transform: 'scale(0)',
        opacity: 0,
        transition: 'all 220ms',
        willChange: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        ...props.style
      },
      bgStyle: {
        background: 'rgba(0, 0, 0, 0.90)',
        transition: 'all 220ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        opacity: 0
      }
    };
  }

  componentDidMount() {
    setTimeout(this.mountStyle, 10); // call the into animiation
  }

  componentWillReceiveProps = newProps => {
    // check for the mounted props
    if (newProps.unMount) {
      setTimeout(this.props.history.goBack, 200);
      return this.unMountStyle(); // call the into animiation
    }
    setTimeout(this.mountStyle, 10); // call the into animiation
  };

  unMountStyle = () => {
    // css for unmount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale(0)',
        opacity: 0,
        transition: 'all 260ms',
        willChange: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        ...this.props.style
      },
      bgStyle: {
        backfaceVisibility: 'hidden',
        perspective: 1000,
        transform: 'translate3d(0, 0, 0) translateZ(0)',
        background: 'rgba(0, 0, 0, 0.90)',
        transition: 'all 260ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        opacity: 0
      }
    });
  };

  mountStyle() {
    // css for mount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale(1)',
        opacity: 1,
        transition: 'all 220ms',
        willChange: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        ...this.props.style
      },
      bgStyle: {
        backfaceVisibility: 'hidden',
        perspective: 1000,
        transform: 'translate3d(0, 0, 0) translateZ(0)',
        background: 'rgba(0, 0, 0, 0.90)',
        transition: 'all 220ms cubic-bezier(0.165, 0.840, 0.440, 1.000)'
      }
    });
  }

  back = e => {
    e.stopPropagation();
    setTimeout(this.unMountStyle, 10); // call the into animiation
    setTimeout(this.props.history.goBack, 220);
  };

  render() {
    return (
      <div
        className={styles.overlay}
        onClick={this.back}
        style={this.state.bgStyle}
      >
        <div
          className={styles.modal}
          style={this.state.style}
          onClick={e => e.stopPropagation()}
        >
          {(this.props.header === undefined || this.props.header === true) && (
            <div className={styles.header}>
              <h3 style={{ display: 'inline-block' }}>
                {this.props.title || 'Modal'}
              </h3>
              <div className={styles.closeBtn} onClick={this.back}>
                <FontAwesomeIcon icon={faWindowClose} />
              </div>
            </div>
          )}
          <div
            className={styles.modalContent}
            style={{
              height:
                this.props.header === undefined || this.props.header === true
                  ? 'calc(100% - 30px)'
                  : '100%'
            }}
          >
            {this.props.backBtn !== undefined && (
              <span onClick={this.back}>{this.props.backBtn}</span>
            )}
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
