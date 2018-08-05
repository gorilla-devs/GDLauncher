// @flow
import React, { Component } from 'react';
import styles from './Home.scss';
import News from './components/News/News';

type Props = {
  +username: string
};

export default class Home extends Component<Props> {
  props: Props;
  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }


  /* eslint-enable */

  render() {
    return (
      <div>
        <main className={styles.content}>
          <News />
        </main>
      </div>
    );
  }
}
