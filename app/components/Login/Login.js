// @flow
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Form, Input, Icon, Checkbox, Tooltip, Modal, message } from 'antd';
import { history } from '../../store/configureStore';
import styles from './Login.css';
import store from '../../localStore';
import OfficialLancherProfilesExists from '../../utils/nativeLauncher';
import * as AuthActions from '../../actions/auth';

type Props = {};

const FormItem = Form.Item;

class Login extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      fastLogin: true
    }
  }

  componentDidMount = () => {
    this.props.checkAccessToken();
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
              transform: (OfficialLancherProfilesExists() && this.state.fastLogin && !this.props.nativeModalOpened) ? 'scale(1)' : 'scale(0)'
            }}>
            <h2>Fast Login Available</h2>
            <p>Do you want us to use the user data you entered in the official Minecraft launcher to log you in?.</p>
            <Button
              size="large"
              style={{ display: 'block', margin: 'auto', marginBottom: '20px', marginTop: '30px' }}
              onClick={() => this.props.tryNativeLauncherProfiles()}
              loading={this.props.tokenLoading}
            >
              Yes, skip log-in and use that data
            </Button>
            <Button
              size="large"
              style={{ display: 'block', margin: 'auto' }}
              onClick={() => { this.setState({ fastLogin: false });; this.props.closeNativeProfiles(); }}
              disabled={this.props.tokenLoading}
            >
              No, take me to manual log-in instead
            </Button>

          </div>
          <div className={styles.login_form}>
            <h1 style={{ textAlign: 'center', fontSize: 30 }}>
              GorillaDevs Login
              {OfficialLancherProfilesExists() &&
                <div
                  style={{ margin: '0 0 0 10px', cursor: 'pointer', display: 'inline-block' }}
                  onClick={() => { this.setState({ fastLogin: true }); this.props.openNativeProfiles(); }}
                >
                  <i className={`${styles.fastLoginIcon} fas fa-forward`} />
                </div>}
            </h1>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: 'Please input your email!' }],
                  initialValue: store.has('lastEmail') ? store.get('lastEmail') : ''
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="user" style={{ color: 'rgba(255,255,255,.8)' }} />}
                    placeholder="Email"
                  />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: 'Please input your Password!' }],
                })(
                  <Input
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
                  />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: true,
                })(
                  <Checkbox>Remember me</Checkbox>
                )}
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
