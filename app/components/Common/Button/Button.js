// @flow
import React, { Component } from 'react';
import styles from './Button.css';

type Props = {
  style: Object,
  hover: Object,
  children: Object,
  onClick: () => void
};

export default class Button extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
      rippleElements: []
    };
  }

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
        <div
          className={`${styles.button} myRipple`}
          onClick={this.clicked.bind(this)}
        >
          {this.props.children}
          {this.state.rippleElements}
        </div>

      </div>
    );
  }
}
