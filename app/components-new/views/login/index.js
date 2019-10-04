import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, CheckBox } from 'ui';
import styled from 'styled-components';
import { login, loginThroughNativeLauncher } from 'reducers/actions';
import Fab from '@material-ui/core/Fab';
import { load } from 'reducers/loading/actions';
import features from 'reducers/loading/features';
import { openModal } from 'reducers/modals/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import OfficialLancherProfilesExists from 'app/utils/nativeLauncher';
import background from '../../../assets/images/loginBackground.jpg';

const Background = styled.div`
  background-image: url("${background}");
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div`
  background: black;
  opacity: 0.5;
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
`;

const Form = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 290px;
  height: 200px;
  vertical-align: middle;
  margin-left -145px;
  left: 50%;
  margin-top -75px;
  top: 50%;
`;

export default () => {
  const dispatch = useDispatch();

  const [nativeLauncherProfiles, setNativeLauncherProfiles] = useState(false);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const isAuthLoading = useSelector(
    state => state.loading.accountAuthentication.isRequesting
  );

  const authError = useSelector(
    state => state.loading.accountAuthentication.error
  );

  useEffect(() => {
    OfficialLancherProfilesExists()
      .then(setNativeLauncherProfiles)
      .catch(console.error);
  }, []);

  const tryLogin = () => {
    return dispatch(
      load(features.accountAuthentication, dispatch(login(email, password)))
    );
  };

  const tryLoginFromNativeLauncher = () => {
    if (authError) {
      setNativeLauncherProfiles(false);
    }
    return dispatch(
      load(
        features.accountAuthentication,
        dispatch(loginThroughNativeLauncher())
      )
    );
  };

  const onKeyPressEnter = e => {
    if (e.key === 'Enter') {
      tryLogin();
    }
  };

  return (
    <Background>
      <Overlay>
        <Form>
          <Input
            disabled={isAuthLoading}
            width="290"
            height="34"
            placeholder="Email"
            onChange={({ target: { value } }) => setEmail(value)}
            onKeyPress={onKeyPressEnter}
          />
          <Input
            disabled={isAuthLoading}
            width="290"
            height="34"
            placeholder="Password"
            type="password"
            onChange={({ target: { value } }) => setPassword(value)}
            onKeyPress={onKeyPressEnter}
          />
          <div
            css={`
              display: inline;
            `}
          >
            <Button
              variant="contained"
              color="primary"
              loading={isAuthLoading}
              disabled={isAuthLoading || !email || !password}
              onClick={tryLogin}
              css={`
                float: right;
              `}
            >
              Login
            </Button>
            <CheckBox color="primary" />
          </div>
          {nativeLauncherProfiles && (
            <Button
              icon="forward"
              loading={isAuthLoading}
              size="large"
              color="primary"
              onClick={tryLoginFromNativeLauncher}
            >
              <span>
                Login As&nbsp;
                <span
                  css={`
                    font-style: italic;
                    text-decoration: underline;
                  `}
                >
                  {nativeLauncherProfiles}
                </span>
              </span>
            </Button>
          )}
        </Form>

        <Fab
          css={`
            position: absolute;
            bottom: 100px;
            left: 70px;
          `}
          size="medium"
          color="primary"
          onClick={() => dispatch(openModal('LoginHelper'))}
        >
          <FontAwesomeIcon icon={faQuestion} />
        </Fab>
      </Overlay>
    </Background>
  );
};
