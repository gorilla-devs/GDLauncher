// @flow
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { Button, Form, Input, Icon, Checkbox, Tooltip } from 'antd';
import log from 'electron-log';
import styles from './Login.scss';
import store from '../../localStore';
import OfficialLancherProfilesExists from '../../utils/nativeLauncher';
import * as AuthActions from '../../actions/auth';
import { THEMES } from '../../constants';
import shader from '../../utils/colors';
import background from '../../assets/images/login_background.jpg';

type Props = {
  form: any,
  login: () => void,
  tryNativeLauncherProfiles: () => void,
  tokenLoading: boolean,
  authLoading: boolean,
  nativeLoading: boolean
};

const FormItem = Form.Item;


// This is awful but it gets the primary color in real time

function Login(props) {

  const [fastLogin, setFastLogin] = useState(true);
  const [nativeLauncherProfiles, setNativeLauncherProfiles] = useState(false);
  const [colors, setColors] = useState(store.get('settings') ? store.get('settings').theme : THEMES.default);

  const [update, setUpdate] = useState({
    updateAvailable: false,
    isUpdating: false,
    updateCompleted: false,
    textUpdate: "Update Available"
  });

  useEffect(async () => {
    setNativeLauncherProfiles(await OfficialLancherProfilesExists());
    if (process.env.NODE_ENV !== 'development') {
      ipcRenderer.send('check-for-updates');
      ipcRenderer.on('update-available', () => {
        setUpdate({ ...update, updateAvailable: true });
      });
      ipcRenderer.on('update-downloaded', () => {
        setUpdate({
          updateAvailable: true,
          isUpdating: false,
          updateCompleted: true,
          textUpdate: "Restart App"
        });
      });
    }
  }, []);

  const handleUpdateClick = () => {
    setUpdate({ ...update, isUpdating: true, textUpdate: "Updating..." })
    ipcRenderer.send('download-updates');
  };

  const handleUpdateCompletedClick = () => {
    ipcRenderer.send('apply-updates');
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.login(values.username, values.password, values.remember);
      } else {
        log.error(err);
      }
    });
  };
  const { getFieldDecorator } = props.form;

  /* eslint-enable */
  return (
    <div>
      <main
        className={styles.content}
        style={{
          background: `linear-gradient( ${colors['secondary-color-2']}8A, ${colors['secondary-color-2']}8A), url(${background})`
        }}
      >
        <div className={styles.login_form}>
          <h1 style={{ textAlign: 'center', fontSize: 30 }}>
            Mojang Login
          </h1>
          <Form onSubmit={handleSubmit}>
            <FormItem>
              {getFieldDecorator('username', {
                rules: [
                  { required: true, message: 'Please input your email!' }
                ],
                initialValue: store.has('lastUsername')
                  ? store.get('lastUsername')
                  : ''
              })(
                <Input
                  disabled={
                    props.tokenLoading ||
                    props.nativeLoading ||
                    props.authLoading
                  }
                  size="large"
                  prefix={
                    <Icon
                      type="user"
                      style={{ color: 'rgba(255,255,255,.8)' }}
                    />
                  }
                  placeholder="Email"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Please input your Password!' }
                ]
              })(
                <Input
                  size="large"
                  disabled={
                    props.tokenLoading ||
                    props.nativeLoading ||
                    props.authLoading
                  }
                  prefix={
                    <Icon
                      type="lock"
                      style={{ color: 'rgba(255,255,255,.8)' }}
                    />
                  }
                  addonAfter={
                    <Link
                      to={{
                        pathname: '/loginHelperModal',
                        state: { modal: true }
                      }}
                      draggable="false"
                    >
                      <Tooltip title="Need Help?">
                        <Icon type="question" />
                      </Tooltip>
                    </Link>
                  }
                  type="password"
                  placeholder="Password"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true
              })(<Checkbox>Remember me</Checkbox>)}
              <Button
                icon="login"
                loading={props.authLoading}
                disabled={props.tokenLoading || props.nativeLoading}
                size="large"
                type="primary"
                htmlType="submit"
                className={styles.login_form_button}
              >
                Log in
                </Button>
            </FormItem>
          </Form>
          {nativeLauncherProfiles && (
            <Button
              icon="forward"
              loading={props.nativeLoading}
              size="large"
              type="primary"
              className={styles.login_form_button}
              style={{ marginTop: '30px' }}
              onClick={() => props.tryNativeLauncherProfiles()}
            >
              <span>Login as <span style={{ fontStyle: 'italic', textDecoration: 'underline' }}>{nativeLauncherProfiles}</span></span>
            </Button>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            color: '#bdc3c7'
          }}
        >
          {update.updateAvailable && (
            <Button
              loading={update.isUpdating}
              onClick={
                update.updateCompleted
                  ? handleUpdateCompletedClick
                  : handleUpdateClick
              }
              type="primary"
              style={{ marginRight: 10 }}
            >
              {update.textUpdate}
            </Button>
          )}
          v{require('../../../package.json').version}
        </div>
      </main>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    authLoading: state.auth.loading,
    isAuthValid: state.auth.isAuthValid,
    tokenLoading: state.auth.tokenLoading,
    nativeLoading: state.auth.nativeLoading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
