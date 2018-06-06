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

  constructor(props) {
    super(props);
    this.state = {
      actualDownload: null
    }
  }

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
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span style={{ color: 'black' }}>{item.name} 0 / {item.libs.length} </span>
                      }
                      description={<Progress percent={50} status="active" />}
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
