import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroller';
import { List, Icon, Avatar, Radio, Button, Skeleton, Transfer } from 'antd';

import styles from './ModsBrowser.scss';

type Props = {};

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);


class ModsBrowser extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      initLoading: true,
      loading: false,
      list: [],
    }
  }

  componentDidMount = async () => {
    const res = await axios.get(`https://staging_cursemeta.dries007.net/api/v3/direct/addon/search?gameId=432&pageSize=10&index=${this.state.list.length}&sort=Featured&categoryId=0&sectionId=6`);
    this.setState({
      initLoading: false,
      list: res.data,
    });
  }

  onLoadMore = async () => {
    this.setState({
      loading: true,
      list: this.state.list.concat([...new Array(10)].map(() => ({ loading: true, name: {} }))),
    });
    const res = await axios.get(`https://staging_cursemeta.dries007.net/api/v3/direct/addon/search?gameId=432&pageSize=10&index=${this.state.list.length}&sort=Featured&categoryId=0&sectionId=6`);
    const data = this.state.list.slice(0, this.state.list.length - 10).concat(res.data);
    this.setState({
      list: data,
      loading: false,
    }, () => {
      // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
      // In a real scene, you can use the public method of react-virtualized:
      // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
      window.dispatchEvent(new Event('resize'));
    });
  }

  render() {
    const { initLoading, loading, list } = this.state;
    const loadMore = !initLoading && !loading ? (
      <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
        <Button onClick={this.onLoadMore}>Load More</Button>
      </div>
    ) : null;
    return (
      <div>
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={list}
          renderItem={item => (
            <List.Item actions={[<a>edit</a>, <a>more</a>]}>
              <Skeleton avatar title={false} loading={item.loading} active>
                <List.Item.Meta
                  avatar={<Avatar src={item.loading ? "" : (item.attachments ? item.attachments[0].thumbnailUrl : "https://www.curseforge.com/Content/2-0-6836-19060/Skins/CurseForge/images/anvilBlack.png")} />}
                  title={item.name}
                  description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {};
}


export default connect(mapStateToProps)(ModsBrowser);
