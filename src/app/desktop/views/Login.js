import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { Input, Button } from 'antd';
import { useKey } from 'rooks';
import { login } from '../../../common/reducers/actions';
import { load, requesting } from '../../../common/reducers/loading/actions';
import features from '../../../common/reducers/loading/features';
import backgroundVideo from '../../../common/assets/background.webm';
import HorizontalLogo from '../../../ui/HorizontalLogo';
import { openModal } from '../../../common/reducers/modals/actions';

const LoginButton = styled(Button)`
  border-radius: 4px;
  font-size: 22px;
  background: ${props =>
    props.active ? props.theme.palette.grey[600] : 'transparent'};
  border: 0;
  height: auto;
  margin-top: 40px;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
  &:focus {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const LeftSide = styled.div`
  position: relative;
  width: 300px;
  padding: 40px;
  height: 100%;
  transition: 0.3s ease-in-out;
  transform: translateX(
    ${({ transitionState }) =>
      transitionState === 'entering' || transitionState === 'entered'
        ? -300
        : 0}px
  );
  background: ${props => props.theme.palette.secondary.main};
  & div {
    margin: 10px 0;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Background = styled.div`
  width: auto;
  height: 100%;
  position: relative;
  video {
    transition: 0.3s ease-in-out;
    transform: translateX(
      ${({ transitionState }) =>
        transitionState === 'entering' || transitionState === 'entered'
          ? -300
          : 0}px
    );
    position: absolute;
    z-index: -1;
    height: 150%;
    top: -30%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 80px);
`;

const FooterLinks = styled.div`
  font-size: 0.75rem;
`;

const Loading = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: -1;
  justify-content: center;
  backdrop-filter: blur(8px) brightness(60%);
  font-size: 40px;
  transition: 0.3s ease-in-out;
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`;
const LoginFailMessage = styled.div`
  color: ${props => props.theme.palette.colors.red};
`;

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [version, setVersion] = useState(null);
  const [loginFailed, setLoginFailed] = useState(false);
  const loading = useSelector(
    state => state.loading.accountAuthentication.isRequesting
  );

  const authenticate = () => {
    if (!email || !password) return;
    dispatch(requesting('accountAuthentication'));
    setTimeout(() => {
      dispatch(
        load(features.mcAuthentication, dispatch(login(email, password)))
      ).catch(e => {
        console.error(e);
        setLoginFailed(true);
        setPassword(null);
      });
    }, 1000);
  };

  useKey(['Enter'], authenticate);

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
  }, []);

  return (
    <Transition in={loading} timeout={300}>
      {transitionState => (
        <Container>
          <LeftSide transitionState={transitionState}>
            <Header>
              <HorizontalLogo size={200} />
            </Header>
            Sign in with your Mojang Account
            <Form>
              <div>
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                />
              </div>
              {loginFailed && (
                <LoginFailMessage>Invalid email or password. </LoginFailMessage>
              )}
              <LoginButton color="primary" onClick={authenticate}>
                SIGN IN
                <FontAwesomeIcon
                  css={`
                    margin-left: 6px;
                  `}
                  icon={faArrowAltCircleRight}
                />
              </LoginButton>
            </Form>
            <Footer>
              <FooterLinks>
                <div>
                  <a href="https://my.minecraft.net/en-us/store/minecraft/#register">
                    CREATE AN ACCOUNT
                  </a>
                </div>
                <div>
                  <a href="https://my.minecraft.net/en-us/password/forgot/">
                    FORGOT PASSWORD
                  </a>
                </div>
              </FooterLinks>
              <div
                css={`
                  cursor: pointer;
                `}
                onClick={() => dispatch(openModal('ChangeLogs'))}
              >
                v{version}
              </div>
            </Footer>
          </LeftSide>
          <Background transitionState={transitionState}>
            <video autoPlay muted loop>
              <source src={backgroundVideo} type="video/webm" />
            </video>
          </Background>
          <Loading transitionState={transitionState}>Loading...</Loading>
        </Container>
      )}
    </Transition>
  );
};

export default Login;
