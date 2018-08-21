// @flow
import React, { Component } from 'react';
import glamorous from 'glamorous';
import styles from './Dot.css';

type Props = {
  Color: string,
  children: Object
};
export default class Dot extends Component<Props> {
  props: Props;

  render() {
    const bgColor = {
      backgroundColor: this.props.Color,
    };
    // Using glamorous to use the pseudoclass before in the underline.
    const UnderlineColor = glamorous.span({
      ':before': {
        backgroundColor: this.props.Color
      },
      ...styles.text
    });
    return (
      <div className={styles.dotContainer}>
        <span className={styles.dot} style={bgColor} />
        <UnderlineColor className={styles.text}>
          {this.props.children}
        </UnderlineColor>
      </div>
    );
  }
}
