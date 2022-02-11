import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import axios from 'axios';
// import { promises as fs } from 'fs';
// import path from 'path';
import Instances from '../components/Instances';
import News from '../components/News';
import { openModal } from '../../../common/reducers/modals/actions';
import {
  _getCurrentAccount
  // _getInstances
} from '../../../common/utils/selectors';
import { extractFace } from '../utils';
import { updateLastUpdateVersion } from '../../../common/reducers/actions';

const AddInstanceIcon = styled(Button)`
  position: fixed;
  bottom: 20px;
  left: 20px;
`;

const AccountContainer = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
`;

const Home = () => {
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);
  const news = useSelector(state => state.news);
  const lastUpdateVersion = useSelector(state => state.app.lastUpdateVersion);
  // const instances = useSelector(_getInstances);

  const openAddInstanceModal = defaultPage => {
    dispatch(openModal('AddInstance', { defaultPage }));
  };

  const openAccountModal = () => {
    dispatch(openModal('AccountsManager'));
  };

  const [profileImage, setProfileImage] = useState(null);
  const [annoucement, setAnnoucement] = useState(null);

  useEffect(() => {
    const init = async () => {
      const appVersion = await ipcRenderer.invoke('getAppVersion');
      if (lastUpdateVersion !== appVersion) {
        dispatch(updateLastUpdateVersion(appVersion));
        dispatch(openModal('ChangeLogs'));
      }
      const { data } = await axios.get(
        'https://api.gdlauncher.com/announcement'
      );
      setAnnoucement(data || null);
    };

    init();
  }, []);

  useEffect(() => {
    extractFace(account.skin).then(setProfileImage).catch(console.error);
  }, [account]);

  return (
    <div>
      <News news={news} />
      {annoucement ? (
        <div
          css={`
            margin-top: 10px;
            padding: 30px;
            font-size: 18px;
            font-weight: bold;
            color: ${props => props.theme.palette.colors.yellow};
          `}
        >
          {annoucement}
        </div>
      ) : null}
      <Instances />
      <AddInstanceIcon type="primary" onClick={() => openAddInstanceModal(0)}>
        <FontAwesomeIcon icon={faPlus} />
      </AddInstanceIcon>
      <AccountContainer type="primary" onClick={openAccountModal}>
        {profileImage ? (
          <img
            src={`data:image/jpeg;base64,${profileImage}`}
            css={`
              width: 15px;
              cursor: pointer;
              height: 15px;
              margin-right: 10px;
            `}
            alt="profile"
          />
        ) : (
          <div
            css={`
              width: 15px;
              height: 15px;
              background: ${props => props.theme.palette.grey[100]};
              margin-right: 10px;
            `}
          />
        )}
        {account && account.selectedProfile.name}
      </AccountContainer>
    </div>
  );
};

export default memo(Home);
