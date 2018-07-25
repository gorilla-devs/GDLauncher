// @flow
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Form, Input, Icon, Checkbox, Tooltip, Modal } from 'antd';
import styles from './Login.css';
import * as AuthActions from '../../actions/auth';

type Props = {};

const FormItem = Form.Item;

class Login extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      helpModalisOpen: false,
      checkingToken: false
    };

    this.openHelpModal = this.openHelpModal.bind(this);
    this.closeHelpModal = this.closeHelpModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  openHelpModal = () => {
    this.setState({ helpModalisOpen: true });
  }

  closeHelpModal = () => {
    this.setState({ helpModalisOpen: false });
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

    if (this.props.tokenLoading) {
      return (
        <div>
          <h1 style={{ textAlign: 'center', position: 'relative', top: '20vw' }}>Checking Access Token...</h1>
        </div>
      );
    }

    return (
      <div>
        <div className={styles.background_image} />
        <div className={styles.background_overlay} />
        <main className={styles.content}>
          <div className={styles.login_form}>
            <h1 style={{ textAlign: 'center', fontSize: 30 }}>GorillaDevs Login</h1>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: 'Please input your email!' }],
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
                <Button icon="login" loading={this.props.authLoading} size="large" type="primary" htmlType="submit" className={styles.login_form_button}>
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
    tokenLoading: state.auth.tokenLoading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
