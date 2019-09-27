// @flow
import React, { useState, useEffect } from 'react';
import { Icon, Button, Popover } from 'antd';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { promisify } from 'util';
import CIcon from '../../../components/Common/Icon/Icon';
import SocialIcon from './SocialIcon';
import vanillaCover from '../../../assets/images/minecraft_vanilla_cover.jpg';
import forgeIcon from '../../../assets/images/forge_icon.jpg';

import styles from './SideBar.scss';
import { PACKS_PATH } from '../../../constants';
import { readConfig } from '../../../utils/instances';
import { getInstance, getCurrentAccount } from '../../../utils/selectors';
import { openModal } from '../../../reducers/modals/actions';

const MainSidebar = styled.aside`
  position: absolute;
  top: calc(${props => props.theme.sizes.height.systemNavbar} + 17px);
  right: 0;
  bottom: 0;
  height: 100%;
  font-family: 'GlacialIndifferenceRegular';
  z-index: 1;
`;

const SecondarySidebar = styled.aside`
  position: absolute;
  top: calc(${props => props.theme.sizes.height.systemNavbar} + 26px);
  right: 0;
  bottom: 0;
  height: 100%;
  font-family: 'GlacialIndifferenceRegular';
  z-index: 0;
`;

type Props = {};

const SideBar = props => {
  const [instanceData, setInstanceData] = useState(null);
  const selectedInstance = useSelector(state => state.selectedInstance);
  const instance = useSelector(state => getInstance(state));
  const account = useSelector(state => getCurrentAccount(state));
  const dispatch = useDispatch();

  const UpdateSideBar = async () => {
    if (selectedInstance !== null) {
      const data = await readConfig(selectedInstance);

      let mods = (instance.mods || []).length;

      try {
        const thumbnail = await promisify(fs.readFile)(
          path.join(PACKS_PATH, selectedInstance, 'thumbnail.png')
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
  }, [selectedInstance]);

  // <aside className={styles.sidenav} style={{ background: '#1C242D' }}>
  return (
    <>
      <MainSidebar>
        <svg
          width="172"
          height="100%"
          viewBox="0 0 172 610"
          fill="#1C242D"
          preserveAspectRatio="xMidYMin"
          // backgroundSize="100% 10%"
        >
          <path
            d="M0 5C0 2.23853 2.23853 0 5 0H58.6074C63.5847 0 68.3833 1.85596 72.0652 5.20508L89.0991 20.6997C98.304 29.0725 110.3 33.7124 122.743 33.7124H169C170.657 33.7124 172 35.0557 172 36.7124V2160H0V5Z"
            fill="#1C242D"
          />
          <rect width="172" bottom="0" />
        </svg>
      </MainSidebar>
      <SecondarySidebar>
        <svg
          width="172"
          height="100%"
          viewBox="0 0 172 601"
          fill="none"
          preserveAspectRatio="xMidYMin"
        >
          <path
            d="M167 0C169.761 0 172 2.23865 172 5V2151H0V42.9629C0 41.306 1.34326 39.9629 3 39.9629H46.7732C60.6875 39.9629 73.9724 34.1647 83.4341 23.9625L99.7217 6.40015C103.506 2.31921 108.82 0 114.386 0H167Z"
            fill="#49515A"
          />
        </svg>
      </SecondarySidebar>
    </>
  );
};

export default SideBar;
