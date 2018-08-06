// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from './NavigationBar.scss';
import HorizontalMenu from './components/HorizontalMenu/HorizontalMenu';
import DownloadManager from '../../DownloadManager/DownloadManager';
import logo from '../../../assets/images/logo.png';


type Props = {
  downloadQueue: array,
  location: string
};
class NavigationBar extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      downloadPopoverOpen: false
    }
  }

  hide = () => {
    this.setState({
      downloadPopoverOpen: false,
    });
  }
  handleVisibleChange = (downloadPopoverOpen) => {
    this.setState({ downloadPopoverOpen });
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.logoText}>
          <img src={logo} height="40px" alt="logo" />
        </div>
        <HorizontalMenu location={this.props.location} />
        <Link to={{
          pathname: '/settings',
          state: { modal: true }
        }}
        >
          <i
            className={`fas fa-cog ${styles.settings}`}
            draggable="false"
          />
        </Link>
        <DownloadManager
          downloadQueue={this.props.downloadQueue}
          open={this.state.downloadPopoverOpen}
          handleOpen={this.handleVisibleChange}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    downloadQueue: state.downloadManager.downloadQueue
  };
}

export default connect(mapStateToProps)(NavigationBar);
