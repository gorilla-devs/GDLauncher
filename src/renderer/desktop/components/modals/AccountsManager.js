import React from 'react';
import styled from 'styled-components';
import { Spin, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { _getCurrentAccount } from 'src/renderer/common/selectors';
import ModalWindow from 'src/renderer/common/components/ModalWindow';
import {
  closeModal,
  openModal
} from 'src/renderer/common/reducers/modals/actions';
import {
  received,
  requesting
} from 'src/renderer/common/reducers/loading/actions';
import features from 'src/renderer/common/reducers/loading/features';
import {
  loginWithAccessToken,
  removeAccount,
  updateCurrentAccountId
} from 'src/renderer/common/reducers/actions';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const accounts = useSelector(state => state.accounts);
  const currentAccount = useSelector(_getCurrentAccount);
  const isLoading = useSelector(
    state => state.loading[features.checkingAccount]
  );
  return (
    <ModalWindow
      css={`
        height: 70%;
        width: 400px;
        max-height: 700px;
      `}
      title="Account Manager"
    >
      <Container>
        <AccountsContainer>
          {Object.values(accounts).map(account => {
            if (!account || !currentAccount) return;
            return (
              <AccountContainer key={account.selectedProfile.id}>
                <AccountItem
                  active={
                    account.selectedProfile.id ===
                    currentAccount.selectedProfile.id
                  }
                  onClick={async () => {
                    if (
                      isLoading.isRequesting ||
                      account.selectedProfile.id ===
                        currentAccount.selectedProfile.id ||
                      !account.accessToken
                    ) {
                      return;
                    }

                    dispatch(requesting(features.checkingAccount));
                    const currentId = currentAccount.selectedProfile.id;
                    await dispatch(
                      updateCurrentAccountId(account.selectedProfile.id)
                    );
                    try {
                      await dispatch(dispatch(loginWithAccessToken()));
                    } catch {
                      await dispatch(updateCurrentAccountId(currentId));
                      message.error('Account not valid');
                    }
                    dispatch(received(features.checkingAccount));
                  }}
                >
                  <div>
                    {account.selectedProfile.name}{' '}
                    <span
                      css={`
                        color: ${props => props.theme.palette.error.main};
                      `}
                    >
                      {!account.accessToken && '(EXPIRED)'}
                    </span>
                  </div>
                  {!account.accessToken && (
                    <HoverContainer
                      onClick={() =>
                        dispatch(
                          openModal('AddAccount', {
                            username: account.user.username
                          })
                        )
                      }
                    >
                      Login again
                    </HoverContainer>
                  )}
                  {account.selectedProfile.id ===
                    currentAccount.selectedProfile.id && (
                    <Spin spinning={isLoading.isRequesting} />
                  )}
                </AccountItem>
                <div
                  css={`
                    margin-left: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: color 0.1s ease-in-out;
                    &:hover {
                      color: ${props => props.theme.palette.error.main};
                    }
                  `}
                >
                  <FontAwesomeIcon
                    onClick={async () => {
                      await dispatch(removeAccount(account.selectedProfile.id));
                      dispatch(closeModal());
                    }}
                    icon={faTrash}
                  />
                </div>
              </AccountContainer>
            );
          })}
        </AccountsContainer>
        <AccountContainer>
          <AccountItem onClick={() => dispatch(openModal('AddAccount'))}>
            Add Account
          </AccountItem>
        </AccountContainer>
      </Container>
    </ModalWindow>
  );
};

export default ProfileSettings;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  justify-content: space-between;
  height: 40px;
  padding: 0 10px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  ${props =>
    props.active ? `background: ${props.theme.palette.primary.main};` : ''}
  transition: background 0.1s ease-in-out;
  &:hover {
    ${props =>
      props.active ? '' : `background: ${props.theme.palette.grey[600]};`}
  }
`;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: blur(4px);
  will-change: opacity;
  &:hover {
    opacity: 1;
  }
`;

const AccountsContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const AccountContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;
