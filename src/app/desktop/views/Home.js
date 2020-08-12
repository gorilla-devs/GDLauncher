import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, Menu } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
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

  // const getOldInstances = async () => {
  //   const oldLauncherUserData = await ipcRenderer.invoke(
  //     'getOldLauncherUserData'
  //   );
  //   let files = [];
  //   try {
  //     files = await fs.readdir(path.join(oldLauncherUserData, 'packs'));
  //   } catch {
  //     // Swallow error
  //   }
  //   return (
  //     await Promise.all(
  //       files.map(async f => {
  //         const stat = await fs.stat(
  //           path.join(oldLauncherUserData, 'packs', f)
  //         );
  //         return stat.isDirectory() ? f : null;
  //       })
  //     )
  //   ).filter(v => v);
  // };

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const init = async () => {
      const appVersion = await ipcRenderer.invoke('getAppVersion');
      if (lastUpdateVersion !== appVersion) {
        dispatch(updateLastUpdateVersion(appVersion));
        dispatch(openModal('ChangeLogs'));
      }

      // const oldInstances = await getOldInstances();
      // if (
      //   oldInstances.length > 0 &&
      //   instances.length === 0 &&
      //   process.env.NODE_ENV !== 'development'
      // ) {
      //   dispatch(openModal('InstancesMigration', { preventClose: true }));
      // }
    };

    init();
  }, []);

  useEffect(() => {
    extractFace(account.skin).then(setProfileImage).catch(console.error);
  }, [account]);

  const menu = (
    <Menu>
      <Menu.Item key="0" onClick={() => openAddInstanceModal(0)}>
        Create Instance
      </Menu.Item>
      <Menu.Item key="1" onClick={() => openAddInstanceModal(1)}>
        Browse Modpacks
      </Menu.Item>
      <Menu.Item key="2" onClick={() => openAddInstanceModal(2)}>
        Import Instance
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <News news={news} />
      <Instances />
      <Dropdown overlay={menu} trigger={['click']}>
        <AddInstanceIcon type="primary">
          <FontAwesomeIcon icon={faPlus} />
        </AddInstanceIcon>
      </Dropdown>
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
