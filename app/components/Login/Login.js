// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Form, Input, Icon, Checkbox, Tooltip } from 'antd';
import styles from './Login.css';
import store from '../../localStore';
import OfficialLancherProfilesExists from '../../utils/nativeLauncher';
import * as AuthActions from '../../actions/auth';

type Props = {
  form: any,
  login: () => void,
  tryNativeLauncherProfiles: () => void,
  tokenLoading: boolean,
  nativeModalOpened: boolean,
  closeNativeProfiles: () => void,
  authLoading: boolean
};

const FormItem = Form.Item;

class Login extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      fastLogin: true,
      nativeLauncherProfiles: false
    };
  }

  componentDidMount = async () => {
    this.ismounted = true;
    const nativeLauncherProfiles = await OfficialLancherProfilesExists();
    // Since this is an async lifecycle method we need to check
    // if the component is still mounted before updating the state
    if (this.ismounted) {
      this.setState({ nativeLauncherProfiles });
    }
  }

  componentWillUnmount = () => {
    this.ismounted = false;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.login(values.username, values.password, values.remember);
      } else {
        console.log(err);
      }
    });
  }

  /* eslint-enable */

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <main className={styles.content}>
          <div
            className={styles.nativeProfilesContainer}
            style={{
              transform: (this.state.nativeLauncherProfiles && this.state.fastLogin && !this.props.nativeModalOpened) ? 'scale(1)' : 'scale(0)'
            }}
          >
            <h2>Fast Login Available</h2>
            <p>We detected that you already logged in the official launcher.</p>
            <p>We can skip the log-in and let you through.</p>
            <Button
              size="large"
              style={{ display: 'block', margin: 'auto', marginBottom: '20px', marginTop: '30px' }}
              onClick={() => this.props.tryNativeLauncherProfiles()}
              loading={this.props.tokenLoading}
            >
              Yes, skip log-in
            </Button>
            <Button
              size="large"
              style={{ display: 'block', margin: 'auto' }}
              onClick={() => { this.setState({ fastLogin: false }); this.props.closeNativeProfiles(); }}
              disabled={this.props.tokenLoading}
            >
              No, let me log-in
            </Button>
          </div>
          <div className={styles.login_form}>
            <h1 style={{ textAlign: 'center', fontSize: 30 }}>
              GorillaDevs Login
              {this.state.nativeLauncherProfiles &&
                <div
                  style={{ margin: '0 0 0 10px', cursor: 'pointer', display: 'inline-block' }}
                  onClick={() => { this.setState({ fastLogin: true }); this.props.openNativeProfiles(); }}
                  onKeyPress={this.handleKeyPress}
                  role="button"
                  tabIndex={0}
                >
                  <i className={`${styles.fastLoginIcon} fas fa-forward`} />
                </div>}
            </h1>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: 'Please input your email!' }],
                  initialValue: store.has('lastEmail') ? store.get('lastEmail') : ''
                })(<Input
                  size="large"
                  prefix={<Icon type="user" style={{ color: 'rgba(255,255,255,.8)' }} />}
                  placeholder="Email"
                />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: 'Please input your Password!' }],
                })(<Input
                  size="large"
                  prefix={<Icon type="lock" style={{ color: 'rgba(255,255,255,.8)' }} />}
                  addonAfter={
                    <Link to={{ pathname: '/loginHelperModal', state: { modal: true } }} draggable="false">
                      <Tooltip title="Need Help?">
                        <Icon type="question" onClick={this.openHelpModal} />
                      </Tooltip>
                    </Link>
                  }
                  type="password"
                  placeholder="Password"
                />)}
              </FormItem>
              <FormItem>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: true,
                })(<Checkbox>Remember me</Checkbox>)}
                <Button icon="login" loading={this.props.authLoading} disabled={this.props.tokenLoading} size="large" type="primary" htmlType="submit" className={styles.login_form_button}>
                  Log in
                </Button>
              </FormItem>
            </Form>
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
    nativeModalOpened: state.auth.nativeProfilesModalOpened
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
