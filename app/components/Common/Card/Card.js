// @flow
import React, { Component } from 'react';
import styles from './Card.scss';

type Props = {
  children: object
};
export default class Card extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} style={this.props.style}>
        <div className={styles.overlay} />
        <div className={styles.container__content}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
