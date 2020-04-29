import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, Menu } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import Instances from '../components/Instances';
import News from '../components/News';
import { openModal } from '../../../common/reducers/modals/actions';
import { _getCurrentAccount } from '../../../common/utils/selectors';
import { extractFace } from '../utils';

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

  const openAddInstanceModal = defaultPage => {
    dispatch(openModal('AddInstance', { defaultPage }));
  };

  const openAccountModal = () => {
    dispatch(openModal('AccountsManager'));
  };
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    extractFace(account.skin).then(setProfileImage).catch(console.error);
  }, [account]);

  const menu = (
    <Menu>
      <Menu.Item key="0" onClick={() => openAddInstanceModal(0)}>
        Empty Instance
      </Menu.Item>
      <Menu.Item key="1" onClick={() => openAddInstanceModal(1)}>
        Modpack Instance
      </Menu.Item>
      <Menu.Divider />
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

export default Home;
