import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { push } from 'connected-react-router';
import { Button, Input, CheckBox } from 'ui';
import styled from 'styled-components';
import {
  login,
  loginWithAccessToken,
  loginThroughNativeLauncher
} from 'reducers/actions';
import Fab from '@material-ui/core/Fab';
import { load } from 'reducers/loading/actions';
import { openModal } from 'reducers/modals/actions';
import features from 'reducers/loading/features';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import OfficialLancherProfilesExists from 'utils/nativeLauncher';
import background from '../../../assets/images/LoginBg.jpg';

const Bg = styled.div`
  background-image: url(${background});
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

const FormRow = styled.div`
  display: inline;
`;

function onKeyPressEnter(e, dispatch) {
  if (e.key === 'Enter') {
    dispatch(login(Email, Password));
  }
}

export default () => {
  const [nativeLauncherProfiles, setNativeLauncherProfiles] = useState(false);
  const [Email, setEmail] = useState(null);
  const [Password, setPassword] = useState(null);
  const [update, setUpdate] = useState(false);

  const isAuthLoading = useSelector(
    state => state.loading.accountAuthentication.isRequesting
  );
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('logInAcessToke');
    loginThroughNativeLauncher();
  }, []);

  useEffect(() => {
    OfficialLancherProfilesExists()
      .then(v => {
        return setNativeLauncherProfiles(v);
      })
      .catch(e => log.error(e));
    if (process.env.NODE_ENV !== 'development') {
      ipcRenderer.send('check-for-updates');
      ipcRenderer.on('update-available', () => {
        setUpdate(true);
      });
    }
  }, []);

  return (
    <Bg>
      <Overlay>
        <Form>
          <Input
            disabled={isAuthLoading}
            width="290"
            height="34"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
            onKeyPress={e => onKeyPressEnter(e, dispatch, Email, Password)}
          />
          <Input
            disabled={isAuthLoading}
            width="290"
            height="34"
            placeholder="password"
            type="password"
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => onKeyPressEnter(e, dispatch, Email, Password)}
          />
          <FormRow>
            <Button
              variant="contained"
              color="primary"
              // onClick={() => dispatch(push('/home'))}
              loading={isAuthLoading}
              disabled={isAuthLoading}
              onClick={() =>
                dispatch(
                  load(
                    features.accountAuthentication,
                    dispatch(login(Email, Password), 'accountAuthentication')
                  )
                )
              }
              css={`
                float: right;
              `}
            >
              Login
            </Button>
            <CheckBox color="primary" />
          </FormRow>
          {nativeLauncherProfiles && (
            <Button
              icon="forward"
              loading={isAuthLoading}
              size="large"
              color="primary"
              css={`
                marginmargin-top: 30px;
              `}
              onClick={() => {
                dispatch(
                  load(
                    features.accountAuthentication,
                    dispatch(loginThroughNativeLauncher())
                  )
                ).catch(err => {});
              }}
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
          onClick={() => dispatch(openModal('loginHelperModal'))}
        >
          <FontAwesomeIcon icon={faQuestion} />
        </Fab>
      </Overlay>
    </Bg>
  );
};
