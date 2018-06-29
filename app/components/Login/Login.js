// @flow
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Form, Input, Icon, Checkbox, Tooltip, Modal } from 'antd';
import styles from './Login.css';
import store from '../../localStore';
import * as AuthActions from '../../actions/auth';

type Props = {};

const FormItem = Form.Item;

class Login extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      helpModalisOpen: false
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
      console.log(values);
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

    if (this.props.isAuthValid) {
      return <Redirect to="/home" />;
    }

    if (store.has('user')) {
      this.props.checkAccessTokenValidity(store.get('user.accessToken'));
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
                  rules: [{ required: true, message: 'Please input your username!' }],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="user" style={{ color: 'rgba(255,255,255,.8)' }} />}
                    placeholder="Username"
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
                      <Tooltip title="Need Help?">
                        <Icon style={{ cursor: 'pointer' }} type="question" onClick={this.openHelpModal} />
                      </Tooltip>
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
            <Link to="/home">
              SKIP
            </Link>
          </div>
        </main>
        <Modal
          visible={this.state.helpModalisOpen}
          footer={null}
          onCancel={this.closeHelpModal}
          title="How does our login system work?"
          destroyOnClose="true"
        >
          <h3>What login credentials should I use?</h3>
          <p>Our launcher uses your normal Mojang credentials,
             so the same you would use in the vanilla launcher</p>
          <h3>Why should i give you my credentials?</h3>
          <p>We use your credentials to ensure you bought the game (it is required by
             Mojang's TOS). We do that by contacting
            Mojang's server and asking them.
          </p>
          <h3>Do you store my credentials in your server?</h3>
          <p>No, we do not store any delicate information about our users. We will
             however store your username/email and other
            related data
          </p>
          <h3>Can I delete the informations you have about me?</h3>
          <p>Sure, you can contact us by email and we will remove any information
             related to you
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://gorilladevs.com/terms"
          >
            If you want to know more, you can check out our Terms of Service
          </a>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    authLoading: state.auth.loading,
    isAuthValid: state.auth.isAuthValid
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
