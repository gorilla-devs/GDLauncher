// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import { Badge, Progress, Icon, List, Popover } from 'antd';
import styles from './DownloadManager.css';

type Props = {
  downloadQueue: Object,
  open: boolean,
  handleOpen: () => void
};

export default class DownloadManager extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Popover
          title={<span style={{ color: 'black' }}>Download Manager</span>}
          content={
            <div style={{ width: 400, height: 300, overflow: 'auto' }}>
              <List
                itemLayout="horizontal"
                dataSource={
                  Object.values(this.props.downloadQueue)
                }
                renderItem={item => (
                  <List.Item style={{ overflowX: 'hidden' }}>
                    <List.Item.Meta
                      title={
                        <span style={{ color: 'black' }}>
                          {item.name} {item.status}

                          <span style={{ float: 'right' }}>
                            {item.downloaded} / {item.totalToDownload}
                          </span>
                        </span>
                      }
                      description={
                        <Progress
                          percent={
                            (() => {
                              switch (item.status) {
                                case 'Queued':
                                  return 0;
                                case 'Downloading':
                                  return Math.floor((item.downloaded * 100) / item.totalToDownload);
                                case 'Completed':
                                  return 100;
                                default:
                                  return 0;
                              }
                            })()
                          }
                          status={((item.downloaded !== item.totalToDownload) || (item.totalToDownload === 0 && item.status !== 'Completed')) ? 'active' : 'success'}
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          }
          trigger="click"
          placement="bottomRight"
          arrowPointAtCenter
          visible={this.props.open}
          onVisibleChange={this.props.handleOpen}
        >
          <Badge count={Object.values(this.props.downloadQueue).length} style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset', cursor: 'pointer' }}>
            <Icon type="download" style={{ fontSize: 22, cursor: 'pointer' }} />
          </Badge>
        </Popover>
      </div>
    );
  }
}
