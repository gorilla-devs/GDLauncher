import React, { useState } from 'react';
import { Input, Select, Button } from 'antd';
import { debounce } from 'lodash';

export default props => {
  const [searchQuery, setSearchQuery] = useState('');

  const onInputChange = debounce(text => {
    setSearchQuery(text);
    props.loadMoreMods(null, null, text, true);
  }, 500);

  return (
    <div
      style={{
        height: 40,
        width: '100%',
        background: 'var(--secondary-color-2)',
        display: 'flex'
      }}
    >
      <Input
        placeholder="Search a mod"
        onChange={e => onInputChange(e.target.value)}
        // onPressEnter={onSearchSubmit}
        style={{ height: 40 }}
        // value={searchQuery}
        allowClear
      />
      <div style={{ padding: '0 5px', height: 40, marginTop: 3 }}>
        <Select
          defaultValue={props.filter}
          onChange={props.setFilter}
          style={{ width: 150, height: 40 }}
        >
          <Select.Option value="featured">Featured</Select.Option>
          <Select.Option value="popularity">Popularity</Select.Option>
          <Select.Option value="lastupdated">Last Updated</Select.Option>
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="author">Author</Select.Option>
          <Select.Option value="totaldownloads">Total Downloads</Select.Option>
        </Select>
      </div>
    </div>
  );
};
