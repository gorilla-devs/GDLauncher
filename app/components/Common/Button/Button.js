// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import Interactive from 'react-interactive';
import styles from './Button.css';

type Props = {
  style: object,
  hover: object,
  children: object,
  onClick: func
};

export default class Button extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
      rippleElements: []
    };
  }

  liClasses = classNames(styles.button, 'myRipple');
  clicked = (e) => {
    const X = e.pageX - e.target.getBoundingClientRect().left;
    const Y = e.pageY - e.target.getBoundingClientRect().top;
    const ripplee = [
      <div style={{ top: Y, left: X }} className={styles.ripple} />
    ];
    this.setState((prevState) => ({ rippleElements: prevState.rippleElements.concat([ripplee]) }));
    setTimeout(() => {
      // const array = this.state.rippleElements;
      // array.splice(0, 1);
      // this.setState({ rippleElements: array });
    }, 900);
    if (typeof this.props.onClick === 'function') {
      this.props.onClick();
    }
  };

  render() {
    return (
      <div>
        <Interactive
          as="button"
          className={this.liClasses}

          hover={this.props.hover}
          style={this.props.style}
          onClick={this.clicked.bind(this)}
        >
          {this.props.children}
          {this.state.rippleElements}
        </Interactive>

      </div>
    );
  }
}
