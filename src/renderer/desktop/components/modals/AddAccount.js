import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Input, Button } from 'antd';
import { load } from 'src/renderer/common/reducers/loading/actions';
import features from 'src/renderer/common/reducers/loading/features';
import { closeModal } from 'src/renderer/common/reducers/modals/actions';
import ModalWindow from 'src/renderer/common/components/ModalWindow';
import { login } from 'src/renderer/common/reducers/authActions';

const AddAccount = ({ username }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(username || '');
  const [password, setPassword] = useState('');

  const addAccount = () => {
    dispatch(load(features.checkingAccount, dispatch(login(email, password))))
      .then(() => dispatch(closeModal()))
      .catch(console.error);
  };

  return (
    <ModalWindow
      css={`
        height: 400px;
        width: 400px;
      `}
      title=" "
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
            disabled={Boolean(username)}
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
    </ModalWindow>
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
