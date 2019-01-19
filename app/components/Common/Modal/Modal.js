import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Modal.scss';

type Props = {};

export default class Modal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.mountStyle = this.mountStyle.bind(this);
    this.unMountStyle = this.unMountStyle.bind(this);
    this.state = { // base css
      style: {
        display: 'block',
        transform: 'scale(0)',
        transition: 'all 150ms',
        willChange: 'transform',
        transitionTimingFunction: 'ease-in-out',
        ...props.style
      },
      bgStyle: {
        background: 'rgba(0, 0, 0, 0.7)',
        transition: 'opacity 150ms ease-in-out',
        opacity: 0
      }
    };
  }

  componentDidMount() {
    setTimeout(this.mountStyle, 10); // call the into animiation
  }

  componentWillReceiveProps = (newProps) => { // check for the mounted props
    if (newProps.unMount) {
      setTimeout(this.props.history.goBack, 200);
      return this.unMountStyle(); // call the into animiation
    }
    setTimeout(this.mountStyle, 10); // call the into animiation
  }


  unMountStyle = () => { // css for unmount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale(0)',
        transition: 'all 150ms',
        willChange: 'transform',
        transitionTimingFunction: 'ease-in-out',
        ...this.props.style
      },
      bgStyle: {
        backfaceVisibility: 'hidden',
        perspective: 1000,
        transform: 'translate3d(0, 0, 0)',
        transform: 'translateZ(0)',
        background: 'rgba(0, 0, 0, 0.7)',
        transition: 'opacity 150ms ease-in-out',
        opacity: 0
      }
    });
  }

  mountStyle() { // css for mount animation
    this.setState({
      style: {
        display: 'block',
        transform: 'scale(1)',
        transition: 'all 150ms',
        willChange: 'transform',
        transitionTimingFunction: 'ease-in-out',
        ...this.props.style
      },
      bgStyle: {
        backfaceVisibility: 'hidden',
        perspective: 1000,
        transform: 'translate3d(0, 0, 0)',
        transform: 'translateZ(0)',
        background: 'rgba(0, 0, 0, 0.7)',
        transition: 'opacity 150ms ease-in-out',
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
          {(this.props.header === undefined || this.props.header === true) &&
            <div className={styles.header}>
              <h3 style={{ display: 'inline-block' }}>{this.props.title || 'Modal'}</h3>
              <Button icon="close" size="small" type="ghost" className={styles.closeBtn} onClick={this.back} />
            </div>
          }
          <div
            className={styles.modalContent}
            style={{
              height: (this.props.header === undefined || this.props.header === true) ? 'calc(100% - 40px)' : '100%'
            }}
          >
            {(this.props.backBtn !== undefined) &&
              <span onClick={this.back}>{this.props.backBtn}</span>
            }
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
