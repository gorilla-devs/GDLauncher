// @flow
import React, { Component } from 'react';
import styles from './Card.scss';

type Props = {
  children: Object,
  externalLink?: boolean,
  style?: Object
};

export default class Card extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} style={this.props.style}>
        <div className={styles.overlay} />
        <div className={styles.container__content}>
          {this.props.children}
          {this.props.externalLink &&
            <div className={styles.externalLink}>
              <i className="fas fa-external-link-alt" />
            </div>}
        </div>
      </div>
    );
  }
}
