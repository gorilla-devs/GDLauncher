import React from 'react';
import { connect } from 'react-redux';
import { Button, Select } from 'antd';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import * as packCreatorActions from '../../../actions/packCreator';
import * as downloadManagerActions from '../../../actions/downloadManager';
import colors from '../../../style/theme/colors.scss';

type Props = {};

const Instances = props => {
  handleForgeVersionChange = value => {
    this.setState({ forgeSelectVersion: value });
  };
  return (
    <div style={{ textAlign: 'center', color: colors.red }}>
      Forge is not installed <br />
      <Select
        style={{ width: '140px' }}
        placeholder="Select a version"
        notFoundContent="No version found"
        onChange={this.handleForgeVersionChange}
      >
        {this.props.forgeVersions[this.props.data.version] &&
          _.reverse(
            this.props.forgeVersions[this.props.data.version].slice()
          ).map(ver => (
            <Select.Option key={ver} value={ver}>
              {ver}
            </Select.Option>
          ))}
      </Select>
      <br />
      <Button
        type="primary"
        onClick={this.installForge}
        style={{ marginTop: 10 }}
      >
        Install Forge
      </Button>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    forgeVersions: state.packCreator.forgeManifest
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { ...packCreatorActions, ...downloadManagerActions },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Instances);
