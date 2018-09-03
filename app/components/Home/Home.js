// @flow
import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { PACKS_PATH, GAME_VERSIONS_URL } from '../../constants';
import styles from './Home.scss';
import News from './components/News/News';
import Card from '../Common/Card/Card';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      latestBtnClicked: false,
      latestInstalled: false
    }
  }
  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }

  componentDidMount = async () => {
    this.props.getNews();
    try {
      await promisify(fs.access)(path.join(PACKS_PATH, '1.13.1'));
      this.setState({ latestInstalled: true });
    } catch (e) {
      this.setState({ latestInstalled: false });
    }
    // Downloads the versions list just the first time
    if (this.props.versionsManifest.length === 0) {
      this.props.getVanillaMCVersions();
    }
  }


  /* eslint-enable */

  render() {
    return (
      <div>
        <main className={styles.content}>
          <div className={styles.innerContent}>
            <News news={this.props.news} />
            <div className={styles.cards}>
              <Card style={{
                marginTop: 10,
                height: 170,
                width: '100%',
                minWidth: 420,
                display: 'block',
                marginTop: 15,
                textAlign: 'center'
              }} title="Try out the new v1.13.1">
                V1.13.1 has just been released. Wanna try it out?
                {this.state.latestBtnClicked || this.state.latestInstalled ?
                  <Link to="/dmanager" style={{ display: 'block', margin: '35px auto' }}>Go to your instances</Link> :
                  <Button
                    type="primary"
                    loading={this.props.packCreationLoading}
                    style={{ display: 'block', margin: '35px auto' }}
                    onClick={() => { this.props.createPack('1.13.1', '1.13.1'); this.setState({ latestBtnClicked: true }) }}
                  >
                    Install and Start v1.13.1
                  </Button>}
              </Card>
            </div>
          </div>
        </main>
      </div >
    );
  }
}
