// @flow
import React, { Component, useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { promises as fs } from 'fs';
import path from 'path';
import { PACKS_PATH, THEMES } from '../../constants';
import styles from './Home.scss';
import News from './components/News/News';
import Card from '../Common/Card/Card';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentAccount } from '../../utils/selectors';
import { createInstance } from '../../reducers/actions';

const Home = props => {
  const [latestBtnClicked, setLatestBtnClicked] = useState(false);
  const [latestInstalled, setLatestInstalled] = useState(false);
  const dispatch = useDispatch();
  const news = useSelector(state => state.news);
  const loading = useSelector(state => state.loading.instance_pre_download.isRequesting);
  const account = useSelector(state => getCurrentAccount(state));

  useEffect(() => {
    fs.access(path.join(PACKS_PATH, '1.13.2')).then(data => {
      setLatestInstalled(true);
    }).catch(e => setLatestInstalled(false));
  });

  /* eslint-disable */
  const openLink = (url) => {
    require('electron').shell.openExternal(url);
  }

  /* eslint-enable */

  return (
    <div>
      <main className={styles.content}>
        <div className={styles.innerContent}>
          <News news={news} />
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
              title={`Welcome ${account.selectedProfile.name} to GDLauncher`}
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
              title="Try out the new v1.13.2"
            >
              V1.13.2 has just been released. Wanna try it out?
                {latestBtnClicked || latestInstalled ? (
                <Link
                  to="/dmanager"
                  style={{ display: 'block', margin: '35px auto' }}
                >
                  Go to your instances
                  </Link>
              ) : (
                  <Button
                    type="primary"
                    loading={loading}
                    style={{ display: 'block', margin: '35px auto' }}
                    onClick={() => {
                      dispatch(createInstance('1.13.2', '1.13.2'));
                      setLatestBtnClicked(true);
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
