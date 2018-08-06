// @flow
import React, { Component } from 'react';
import styles from './Home.scss';
import News from './components/News/News';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;
  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }

  componentDidMount = () => {
    this.props.getNews();
  }
  

  /* eslint-enable */

  render() {
    return (
      <div>
        <main className={styles.content}>
          <News news={this.props.news} />
        </main>
      </div>
    );
  }
}
