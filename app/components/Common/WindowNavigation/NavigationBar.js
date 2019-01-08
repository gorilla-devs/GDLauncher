// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styles from './NavigationBar.scss';
import HorizontalMenu from './components/HorizontalMenu/HorizontalMenu';
import * as downloadManagerActions from '../../../actions/downloadManager';
import logo from '../../../assets/images/logo.png';

type Props = {
  downloadQueue: Object,
  location: string
};
class NavigationBar extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      downloadPopoverOpen: false
    };
  }

  hide = () => {
    this.setState({
      downloadPopoverOpen: false
    });
  };
  handleVisibleChange = downloadPopoverOpen => {
    this.setState({ downloadPopoverOpen });
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.logoText}>
          <img src={logo} height="40px" alt="logo" draggable="false" />
        </div>
        <HorizontalMenu
          location={this.props.location}
        />
        <Link
          to={{
            pathname: '/settings/myAccount_Preferences',
            state: { modal: true }
          }}
        >
          <i className={`fas fa-cog ${styles.settings}`} draggable="false" />
        </Link>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(downloadManagerActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationBar);
