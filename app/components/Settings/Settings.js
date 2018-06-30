// @flow
import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router';
import { Redirect, Link } from 'react-router-dom';
import { Select, Form, Input, Icon, Button, Modal, Menu, Layout } from 'antd';
import styles from './Settings.css';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;


type Props = {};

class VanillaModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    }
  }

  componentDidMount = () => {

  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    return (
      <Modal
        visible={true}
        footer={null}
        style={{
          minWidth: '100%',
          height: '100%',
          top: 0,
          padding: 0,
          margin: 0
        }}
        bodyStyle={{ maxHeight: 'calc(100vh - 54.6px)', minHeight: 'calc(100vh - 54.6px)', overflowY: 'scroll', }}
        onCancel={() => {
          this.props.history.goBack();
        }}
        title="GDLauncher Settings"
        destroyOnClose="true"
      >
        <Layout>
          <Sider
            style={{
              overflow: 'auto',
              height: 'calc(100vh - 54.6px)',
              position: 'fixed',
              left: 0,
              top: 54.6,
            }}
            collapsible
            collapsed={this.state.collapsed}
            onCollapse={this.toggleCollapsed}
          >
            <div className="logo" />
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
              <Menu.Item key="1">
                <Icon type="user" />
                <span className="nav-text">nav 3</span>
                <Link
                  className="nav-text"
                  to={{ pathname: '/settings', state: { modal: true } }}
                />
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="video-camera" />
                <Link className="nav-text" to={{ pathname: '/settings/1', state: { modal: true } }}>nav 2</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="upload" />
                <span className="nav-text">nav 3</span>
              </Menu.Item>
              <Menu.Item key="4">
                <Icon type="bar-chart" />
                <span className="nav-text">nav 4</span>
              </Menu.Item>
              <Menu.Item key="5">
                <Icon type="cloud-o" />
                <span className="nav-text">nav 5</span>
              </Menu.Item>
              <Menu.Item key="6">
                <Icon type="appstore-o" />
                <span className="nav-text">nav 6</span>
              </Menu.Item>
              <Menu.Item key="7">
                <Icon type="team" />
                <span className="nav-text">nav 7</span>
              </Menu.Item>
              <Menu.Item key="8">
                <Icon type="shop" />
                <span className="nav-text">nav 8</span>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ marginLeft: this.state.collapsed ? 90 : 200 }}>
            <Header style={{ background: '#fff', padding: 0 }} />
            <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
              <div style={{ padding: 24, color: '#fff', textAlign: 'center' }}>
                ...
          <br />
                {
                  <Switch>
                    <Route path="/settings/1" component={() => ("1")} />
                    <Route path="/settings/2" component={() => ("2")} />
                    <Route path="/settings" component={() => ("CIAO")} />
                  </Switch>
                }
                <br />...<br />...<br />...<br />
                long
          <br />...<br />...<br />...<br />...<br />...<br />...
          <br />...<br />...<br />...<br />...<br />...<br />...
          <br />...<br />...<br />...<br />...<br />...<br />...
          <br />...<br />...<br />...<br />...<br />...<br />...
          <br />...<br />...<br />...<br />...<br />...<br />...
          <br />...<br />...<br />...<br />...<br />...<br />...
          <br />...<br />...<br />...<br />...<br />...<br />
                content
        </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              Ant Design ©2016 Created by Ant UED
            </Footer>
          </Layout>
          <Button key="back">Back</Button>
          <Button key="submit" type="primary">
            Save
          </Button>
        </Layout>
      </Modal>
    );
  }
}

export default withRouter(VanillaModal);