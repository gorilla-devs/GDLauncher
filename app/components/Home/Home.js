// @flow
import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
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
    this.props.getNews();
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
                <div
                  style={{
                    display: 'flex',
                    alignContent: 'center',
                    width: '100%',
                    margin: '0 0 10px 0'
                  }}
                >
                  <div style={{ flexBasis: '70%', textAlign: 'center' }}>
                    Did you know you can customize the
                    colors the way you like?
                    <br />
                    Isn't it great? Wanna try green and yellow? Red and Purple?
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        marginTop: 20
                      }}
                    >
                      <Button type="primary" style={{ width: 130 }} onClick={() => this.props.applyTheme(THEMES.default)}>
                        Default
                      </Button>
                      <Button type="primary" style={{ width: 130 }} onClick={() => this.props.applyTheme(THEMES.carrotUniverse)}>
                        Carrot Universe
                      </Button>
                      <Button type="primary" style={{ width: 130 }} onClick={() => this.props.applyTheme(THEMES.concreteLeaf)}>
                        Concrete Leaf
                      </Button>
                    </div>
                    <div className={styles.textWithLines}>Or</div>
                    <Link
                      to={{
                        pathname: '/settings/ui',
                        state: { modal: true }
                      }}
                    >
                      <Button type="primary" style={{ width: 160 }}>
                        Create Your Own!
                      </Button>
                    </Link>
                  </div>
                  <div style={{ flexBasis: '30%', textAlign: 'center' }}>
                    <h2>Hey you! Yes, you!</h2>
                    <img
                      draggable="false"
                      src="http://www.stickpng.com/assets/images/580b57fcd9996e24bc43c2fb.png"
                      width="100%"
                    />
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
                title="Try out the new v1.13.2"
              >
                V1.13.2 has just been released. Wanna try it out?
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
                      this.props.createPack('1.13.2', '1.13.2');
                      this.setState({ latestBtnClicked: true });
                    }}
                  >
                    Install and Start v1.13.2
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
