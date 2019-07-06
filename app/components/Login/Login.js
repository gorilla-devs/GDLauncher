// @flow
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { useTranslation } from 'react-i18next';
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
import { tryNativeLauncherProfiles, login } from '../../actions/auth';

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
  const { t } = useTranslation();
  const [colors, setColors] = useState(
    store.get('settings') ? store.get('settings').theme : THEMES.default
  );

  const [update, setUpdate] = useState(false);

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
          background: `linear-gradient( ${colors['secondary-color-2']}8A, ${
            colors['secondary-color-2']
            }8A), url(${background})`
        }}
      >
        <div className={styles.login_form}>
          <h1 style={{ textAlign: 'center', fontSize: 30 }}>{t('MojangLogin', 'Mojang Login')}</h1>
          <Form onSubmit={handleSubmit}>
            <FormItem>
              {getFieldDecorator('username', {
                rules: [
                  { required: true, message: t('InputEmail', 'Please Input Your Email') }
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
                  placeholder={t('Email', 'Email')}
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: t('InputPassword', 'Please Input Your Password') }
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
                      <Tooltip title={t('NeedHelp', 'Need Help?')}>
                        <Icon type="question" />
                      </Tooltip>
                    </Link>
                  }
                  type="password"
                  placeholder={t('Password', 'Password')}
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true
              })(<Checkbox>{t('RememberMe', 'Remember Me')}</Checkbox>)}
              <Button
                icon="login"
                loading={props.authLoading}
                disabled={props.tokenLoading || props.nativeLoading}
                size="large"
                type="primary"
                htmlType="submit"
                className={styles.login_form_button}
              >
                {t('LogIn', 'Log In')}
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
              <span>
                {t('LoginAs', 'Login As')}{' '}
                <span
                  style={{ fontStyle: 'italic', textDecoration: 'underline' }}
                >
                  {nativeLauncherProfiles}
                </span>
              </span>
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
          {update && (
            <Link to="/autoUpdate">
              <Button type="primary" style={{ marginRight: 10 }}>
                {t('UpdateAvailable', 'Update Available')}
              </Button>
            </Link>
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

const mapDispatchToProps = {
  login,
  tryNativeLauncherProfiles
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
