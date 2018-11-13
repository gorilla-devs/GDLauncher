// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
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

class Login extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      fastLogin: true,
      nativeLauncherProfiles: false
    };
  }

  componentWillMount = () => {
    this.colors = store.get('settings') ? store.get('settings').theme : THEMES.default;
  }
  

  componentDidMount = async () => {
    this.ismounted = true;
    const nativeLauncherProfiles = await OfficialLancherProfilesExists();
    // Since this is an async lifecycle method we need to check
    // if the component is still mounted before updating the state
    if (this.ismounted) {
      this.setState({ nativeLauncherProfiles });
    }
  };

  componentWillUnmount = () => {
    this.ismounted = false;
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.login(values.username, values.password, values.remember);
      } else {
        log.error(err);
      }
    });
  };

  /* eslint-enable */

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <main
          className={styles.content}
          style={{
            background: `linear-gradient( ${this.colors['secondary-color-2']}8A, ${this.colors['secondary-color-2']}8A), url(${background})`
          }}
        >
          <div className={styles.login_form}>
            <h1 style={{ textAlign: 'center', fontSize: 30 }}>
              GorillaDevs Login
            </h1>
            <Form onSubmit={this.handleSubmit}>
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
                      this.props.tokenLoading ||
                      this.props.nativeLoading ||
                      this.props.authLoading
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
                      this.props.tokenLoading ||
                      this.props.nativeLoading ||
                      this.props.authLoading
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
                          <Icon type="question" onClick={this.openHelpModal} />
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
                  loading={this.props.authLoading}
                  disabled={this.props.tokenLoading || this.props.nativeLoading}
                  size="large"
                  type="primary"
                  htmlType="submit"
                  className={styles.login_form_button}
                >
                  Log in
                </Button>
              </FormItem>
            </Form>
            {this.state.nativeLauncherProfiles && (
              <Button
                icon="forward"
                loading={this.props.nativeLoading}
                size="large"
                type="primary"
                className={styles.login_form_button}
                style={{ marginTop: '30px' }}
                onClick={() => this.props.tryNativeLauncherProfiles()}
              >
                Skip login
              </Button>
            )}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              right: 30,
              color: '#bdc3c7'
            }}
          >
            v{require('../../../package.json').version}
          </div>
        </main>
      </div>
    );
  }
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
