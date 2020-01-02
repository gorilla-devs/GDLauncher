// @flow
import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { PACKS_PATH, THEMES } from '../../constants';
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
    };
  }
  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url);
  }

  componentDidMount = async () => {
    try {
      await promisify(fs.access)(path.join(PACKS_PATH, '1.13.2'));
      this.setState({ latestInstalled: true });
    } catch (e) {
      this.setState({ latestInstalled: false });
    }
    // Downloads the versions list just the first time
    if (this.props.versionsManifest.length === 0) {
      this.props.getVanillaMCVersions();
    }
  };

  /* eslint-enable */

  render() {
    const suggestedMCVersion = '1.15.1'
    return (
      <div>
        <main className={styles.content}>
          <div className={styles.innerContent}>
            <News news={this.props.news} />
            <div className={styles.cards}>
              <Card
                style={{
                  height: 'auto',
                  width: '100%',
                  minWidth: 420,
                  display: 'block',
                  marginTop: 15,
                  textAlign: 'center'
                }}
                title={`Welcome ${this.props.username} to GDLauncher`}
              >
                <div className={styles.firstCard}>
                  <div>
                    <span className={styles.titleHeader}>
                      GDLauncher is now on{' '}
                      <a
                        href="https://patreon.com/gorilladevs"
                        className={styles.patreonText}
                      >
                        Patreon
                      </a>
                    </span>
                    <div className={styles.patreonContent}>
                      If you like GDLauncher and you would like it to have even
                      more features and bug fixes, consider helping us out
                      supporting the project. Happy Gaming!
                    </div>
                  </div>
                  <div>
                    You can find us here:
                    <div className={styles.discord}>
                      <a href="https://discord.gg/ZxRxPqn">Discord</a>
                    </div>
                    <div className={styles.github}>
                      <a href="https://github.com/gorilla-devs/GDLauncher">
                        Github
                      </a>
                    </div>
                    <div className={styles.instagram}>
                      <a href="https://instagram.com/gdlauncher">Instagram</a>
                    </div>
                    <div className={styles.facebook}>
                      <a href="https://facebook.com/gorilladevs">Facebook</a>
                    </div>
                  </div>
                </div>
              </Card>
              <Card
                style={{
                  height: 170,
                  width: '100%',
                  minWidth: 420,
                  display: 'block',
                  marginTop: 15,
                  textAlign: 'center'
                }}
                title={`Try out the new ${suggestedMCVersion}`}
              >
                V1.15.1 has just been released. Wanna try it out?
                {this.state.latestBtnClicked || this.state.latestInstalled ? (
                  <Link
                    to="/dmanager"
                    style={{ display: 'block', margin: '35px auto' }}
                  >
                    Go to your instances
                  </Link>
                ) : (
                  <Button
                    type="primary"
                    loading={this.props.packCreationLoading}
                    style={{ display: 'block', margin: '35px auto' }}
                    onClick={() => {
                      this.props.createPack(`${suggestedMCVersion}`, `${suggestedMCVersion}`);
                      this.setState({ latestBtnClicked: true });
                    }}
                  >
                    Install and Start {suggestedMCVersion}
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
