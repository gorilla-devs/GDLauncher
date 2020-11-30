/* eslint-disable react/no-unescaped-entities */
import React, { memo } from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from 'src/renderer/common/components/ProvideAuth';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { Button, Checkbox, Input } from 'antd';

const Login = () => {
  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();

  const { from } = location.state || { from: { pathname: '/profile' } };

  const login = () => {
    console.log('GGg', from);
    auth.signin(() => {
      history.replace(from);
    });
  };

  return (
    <Container>
      <div
        css={`
          /* position: absolute; */
          /* top: 70px; */
          margin-top: 70px;
          Input {
            margin: 10px 0;
          }
          Button {
            margin-top: 20px;
          }
        `}
      >
        <Input placeholder="Email" />
        <Input placeholder="Password" />
        <div>
          <div
            css={`
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding: 5px;
            `}
          >
            <div
              css={`
                display: flex;
                justify-content: space-between;
                align-items: center;
              `}
            >
              <Checkbox />
              &nbsp; Remember me
            </div>
            <h5>Forget Password?</h5>
          </div>
        </div>
        <div
          css={`
            margin-top: 30px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 5px;
          `}
        >
          <Button type="primary" onClick={login}>
            Login
          </Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </Container>
  );
};

export default memo(Login);

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
  padding: 40px 20%;
  position: relative;
`;
