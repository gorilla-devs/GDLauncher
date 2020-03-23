import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Input, Button } from 'antd';
import Modal from '../components/Modal';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import { login } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';

const AddAccount = ({ username }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(username || '');
  const [password, setPassword] = useState('');

  const addAccount = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(login(email, password, false)))
    )
      .then(() => dispatch(closeModal()))
      .catch(console.error);
  };

  return (
    <Modal
      css={`
        height: 400px;
        width: 400px;
      `}
    >
      <Container>
        <FormContainer>
          <h1
            css={`
              height: 80px;
            `}
          >
            Mojang login
          </h1>
          <StyledInput
            disabled={!!username}
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
        <FormContainer>
          <StyledButton onClick={addAccount}>Add Account</StyledButton>
        </FormContainer>
      </Container>
    </Modal>
  );
};

export default AddAccount;

const StyledInput = styled(Input)`
  && {
    margin-bottom: 20px;
  }
`;

const StyledButton = styled(Button)`
  width: 40%;
`;

const FormContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  justify-content: center;
`;
