import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import ContentLoader from 'react-content-loader';
import path from 'path';
import Promise from 'bluebird';
import _ from 'lodash';
import { Button, Select } from 'antd';
import { PACKS_PATH, CURSEMETA_API_URL } from '../../../../constants';
import { downloadFile } from '../../../../utils/downloader';

import styles from './ModPage.scss';

type Props = {};

class ModPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      installing: [],
      selectedVersion: null
    };
  }

  componentDidMount = () => {
    this.getAddonData(this.props.match.params.mod);
  };

  installMod = async (data, parent = null) => {
    const { projectFileId, projectFileName } = data.gameVersionLatestFiles
      ? data.gameVersionLatestFiles.find(
          n => n.gameVersion === this.props.match.params.version
        )
      : data;
    if (parent === null) {
      this.setState(prevState => ({
        installing: {
          ...prevState.installing,
          [projectFileName]: {
            installing: true,
            completed: false
          }
        }
      }));
    }

    const url = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/${data.id}/file/${projectFileId}`
    );

    await downloadFile(
      path.join(
        PACKS_PATH,
        this.props.match.params.instance,
        'mods',
        url.data.fileNameOnDisk
      ),
      url.data.downloadUrl,
      () => {}
    );
    if (url.data.dependencies.length !== 0) {
      url.data.dependencies.forEach(async dep => {
        // It looks like type 1 are required dependancies and type 3 are dependancies that are already embedded in the parent one
        if (dep.type === 1 && dep.addonId !== data.id) {
          const depData = await axios.get(
            `${CURSEMETA_API_URL}/direct/addon/${dep.addonId}`
          );
          await this.installMod(depData.data, projectFileName);
        }
      });
    }
    this.setState(prevState => ({
      installing: {
        ...prevState.installing,
        [parent === null ? projectFileName : parent]: {
          installing: false,
          completed: true
        }
      }
    }));
  };

  getAddonData = async addon => {
    const [{ data }, files] = await Promise.all([
      axios.get(`${CURSEMETA_API_URL}/direct/addon/${addon}`),
      axios.get(`${CURSEMETA_API_URL}/direct/addon/${addon}/files`)
    ]);

    const filteredFiles = files.data.filter(el =>
      el.gameVersion.includes(this.props.match.params.version)
    );

    this.setState({
      data: {
        ...data,
        allFiles: _.orderBy(filteredFiles, ['fileDate'], ['desc'])
      }
    });
  };

  isDownloadCompleted = data => {
    return this.state.installing[data] && this.state.installing[data].completed;
  };

  isInstalling = data => {
    return (
      this.state.installing[data] && this.state.installing[data].installing
    );
  };

  handleModVersionChange = version => {
    this.setState({ selectedVersion: version });
  };

  render() {
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: 10 }}>
        {!this.state.data ? (
          <div>
            <ContentLoader
              height={350}
              width={500}
              speed={0.6}
              primaryColor="var(--secondary-color-2)"
              secondaryColor="var(--secondary-color-3)"
              style={{
                height: '350px',
                width: '500px',
                marginTop: 20
              }}
            >
              <rect x="100" y="10" rx="0" ry="0" width={320} height="20" />
              <rect x="10" y="70" rx="0" ry="0" width={480} height="30" />
              <rect x="10" y="110" rx="0" ry="0" width={480} height="30" />
              <rect x="10" y="150" rx="0" ry="0" width={480} height="30" />
              <rect x="10" y="230" rx="0" ry="0" width={50} height="50" />
              <rect x="70" y="230" rx="0" ry="0" width={420} height="17" />
              <rect x="70" y="260" rx="0" ry="0" width={420} height="17" />
              <rect x="10" y="290" rx="0" ry="0" width={480} height="17" />
              <rect x="10" y="320" rx="0" ry="0" width={480} height="17" />
            </ContentLoader>
          </div>
        ) : (
          <div>
            <h1 style={{ textAlign: 'center' }}>{this.state.data.name}</h1>
            <div className={styles.modActions}>
              <div
                style={{
                  width: '45%',
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center'
                }}
              >
                <Button
                  type="primary"
                  onClick={() =>
                    this.installMod({
                      id: this.state.data.id,
                      projectFileId: this.state.data.allFiles[0].id,
                      projectFileName: this.state.data.allFiles[0]
                        .fileNameOnDisk
                    })
                  }
                  loading={this.isInstalling(
                    this.state.data.allFiles[0].fileNameOnDisk
                  )}
                  disabled={this.isDownloadCompleted(
                    this.state.data.allFiles[0].fileNameOnDisk
                  )}
                >
                  Install Latest
                </Button>
              </div>
              <span>Or</span>
              <div style={{ width: '45%' }}>
                <Select
                  style={{
                    width: '200px',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  placeholder="Select a version"
                  notFoundContent="No version found"
                  onChange={this.handleModVersionChange}
                >
                  {this.state.data.allFiles.map(ver => (
                    <Select.Option
                      key={ver.fileNameOnDisk}
                      value={ver.fileNameOnDisk}
                    >
                      {ver.fileNameOnDisk}
                    </Select.Option>
                  ))}
                </Select>
                <br />
                <Button
                  type="primary"
                  onClick={() =>
                    this.installMod({
                      id: this.state.data.id,
                      projectFileId: this.state.data.allFiles.find(
                        v => v.fileNameOnDisk === this.state.selectedVersion
                      ).id,
                      projectFileName: this.state.data.allFiles.find(
                        v => v.fileNameOnDisk === this.state.selectedVersion
                      ).fileNameOnDisk
                    })
                  }
                  loading={this.isInstalling(this.state.selectedVersion)}
                  disabled={this.isDownloadCompleted(
                    this.state.selectedVersion
                  )}
                  style={{ display: 'block', margin: '0 auto' }}
                >
                  {this.isInstalling(this.state.selectedVersion)
                    ? 'Installing'
                    : this.isDownloadCompleted(this.state.selectedVersion)
                    ? 'Installed'
                    : 'Install Selected Mod'}
                </Button>
              </div>
            </div>
            <h2 style={{ textAlign: 'center' }}>Description</h2>
            <div className={styles.modDescription}>
              <span
                dangerouslySetInnerHTML={{
                  __html: this.state.data.fullDescription
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ModPage);
