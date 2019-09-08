// @flow
import React, { useState, useEffect } from 'react';
import { Icon, Button, Popover } from 'antd';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { promisify } from 'util';
import CIcon from '../Icon/Icon';
import SocialIcon from './SocialIcon';
import vanillaCover from '../../../assets/images/minecraft_vanilla_cover.jpg';
import forgeIcon from '../../../assets/images/forge_icon.jpg';

import styles from './SideBar.scss';
import { PACKS_PATH } from '../../../constants';

import * as AuthActions from '../../../actions/accounts';
import * as ProfileActions from '../../../actions/profile';

type Props = {};

const SideBar = props => {
  const [instanceData, setInstanceData] = useState(null);

  const UpdateSideBar = async () => {
    if (props.selectedInstance !== null) {
      const data = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.selectedInstance, 'config.json')
        )
      );

      let mods = 0;

      try {
        mods = (await fs.readdirAsync(
          path.join(PACKS_PATH, props.selectedInstance, 'mods')
        ))
          .filter(el => el !== 'GDLCompanion.jar' && el !== 'LJF.jar')
          .filter(
            el => path.extname(el) === '.zip' || path.extname(el) === '.jar'
          ).length;
      } catch {}

      try {
        const thumbnail = await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.selectedInstance, 'thumbnail.png')
        );
        setInstanceData({
          ...data,
          thumbnail: `data:image/png;base64,${thumbnail.toString('base64')}`,
          mods
        });
      } catch {
        setInstanceData({
          ...data,
          mods,
          thumbnail: null
        });
      }
    } else {
      setInstanceData(null);
    }
  };

  useEffect(() => {
    UpdateSideBar();
  }, [props.selectedInstance]);

  return (
    <aside className={styles.sidenav}>
      <div className={styles.account}>
        <div className={styles.header}>
          <span>
            <CIcon size={32}>
              {props.username && props.username.charAt(0).toUpperCase()}
            </CIcon>
          </span>
          <span>{props.username}</span>
          <div onClick={() => props.logout()}>
            <FontAwesomeIcon icon={faSignOutAlt} className={styles.logout} />
          </div>
        </div>
      </div>
      <hr />
      <div className={styles.instanceTitle}>
        <h2>Bookmarked Servers</h2>
        No server
      </div>
      <hr />
      <div className={styles.instanceTitle}>
        <h2>Instance Overview</h2>
        {instanceData !== null ? (
          <div style={{ marginTop: 10 }}>
            <h3 style={{ color: '#c2c2c2' }}>{props.selectedInstance}</h3>
            <img
              src={instanceData.thumbnail || vanillaCover}
              style={{
                position: 'relative',
                left:
                  instanceData.forgeVersion === null || instanceData.thumbnail
                    ? 0
                    : 25,
                height: 100,
                width: 150,
                objectFit: 'cover',
                borderRadius: 2
              }}
            />
            {instanceData.forgeVersion !== null && !instanceData.thumbnail && (
              <img
                src={forgeIcon}
                style={{
                  position: 'relative',
                  width: 50,
                  height: 50,
                  top: -25,
                  right: 25,
                  borderRadius: '2px'
                }}
              />
            )}
            <div
              style={{
                position: 'relative',
                top: 30,
                background: '#c0392b',
                width: 150,
                height: 30,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                left: 25
              }}
            >
              <span style={{ padding: '0 5px' }}>MC version:</span>
              <span style={{ padding: '0 5px' }}>{instanceData.version}</span>
            </div>
            {instanceData.forgeVersion !== null && (
              <div
                style={{
                  position: 'relative',
                  top: 40,
                  background: '#f39c12',
                  width: 150,
                  height: 30,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  left: 25
                }}
              >
                <span style={{ padding: '0 5px' }}>mods:</span>
                <span style={{ padding: '0 5px' }}>{instanceData.mods}</span>
              </div>
            )}
            <div
              style={{
                position: 'relative',
                top: instanceData.forgeVersion !== null ? 50 : 40,
                background: '#27ae60',
                width: 150,
                height: 30,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                left: 25
              }}
            >
              <span style={{ padding: '0 5px' }}>Played for:</span>
              <span style={{ padding: '0 5px' }}>
                {instanceData.timePlayed && instanceData.timePlayed !== null
                  ? instanceData.timePlayed
                  : '0'}{' '}
                m
              </span>
            </div>
          </div>
        ) : (
          'No instance selected'
        )}
      </div>
      <div className={styles.scroller} />
      <hr style={{ margin: 0 }} />
      <div className={styles.socialsContainer}>
        {/* eslint-disable */}
        {/* <SocialIcon icon="twitter" url="https://twitter.com/gorilladevs" /> */}
        <SocialIcon icon={faFacebook} url="https://facebook.com/gorilladevs" />
        <SocialIcon
          icon={faDiscord}
          url="https://discordapp.com/invite/4cGYzen"
        />
        <span className={styles.version}>
          <Link to={{ pathname: '/changelogs', state: { modal: true } }}>
            v{require('../../../../package.json').version}
          </Link>
        </span>
        {/* eslint-enable */}
      </div>
    </aside>
  );
};

const mapStateToProps = state => ({
  username: state.auth.displayName,
  selectedInstance: state.instancesManager.selectedInstance
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...ProfileActions }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideBar);
