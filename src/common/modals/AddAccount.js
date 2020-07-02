import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Input, Button, Radio } from 'antd';
import Modal from '../components/Modal';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import { loginMojang, loginOffline } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';

const AddAccount = ({ username: current }) => {
  const dispatch = useDispatch();
  const [accountType, setAccountType] = useState('offline');
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(current || '');
  const [password, setPassword] = useState('');

  const addAccount = () => {
    if (accountType === 'offline') {
      dispatch(
        load(features.mcAuthentication, dispatch(loginOffline(username, false)))
      )
        .then(() => dispatch(closeModal()))
        .catch(console.error);
    }

    if (accountType === 'mojang') {
      dispatch(
        load(
          features.mcAuthentication,
          dispatch(loginMojang(email, password, false))
        )
      )
        .then(() => dispatch(closeModal()))
        .catch(console.error);
    }
  };

  return (
    <Modal
      css={`
        height: 400px;
        width: 400px;
      `}
      title=" "
    >
      <Container>
        <Radio.Group
          onChange={({ target: { value } }) => setAccountType(value)}
          defaultValue="offline"
        >
          <Radio.Button value="offline">Offline</Radio.Button>
          <Radio.Button value="mojang">Mojang</Radio.Button>
        </Radio.Group>

        {accountType === 'offline' && (
          <FormContainer>
            <h1
              css={`
                height: 80px;
              `}
            >
              Offline login
            </h1>
            <StyledInput
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </FormContainer>
        )}

        {accountType === 'mojang' && (
          <FormContainer>
            <h1
              css={`
                height: 80px;
              `}
            >
              Mojang login
            </h1>
            <StyledInput
              disabled={!!current}
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <StyledInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </FormContainer>
        )}

        <FormContainer>
          <StyledButton onClick={addAccount}>Add Account</StyledButton>
        </FormContainer>
      </Container>
    </Modal>
  );
};

export default AddAccount;

const StyledInput = styled(Input)`
  margin-bottom: 20px;
`;

const StyledButton = styled(Button)`
  width: 40%;
`;

const FormContainer = styled.div`
  width: 80%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  justify-content: center;
  align-items: center;
`;
