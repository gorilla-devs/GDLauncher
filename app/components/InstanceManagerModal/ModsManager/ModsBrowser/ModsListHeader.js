import React, { useState } from 'react';
import { Input, Select, Button } from 'antd';
import { debounce } from 'lodash';

export default props => {
  const loadMoreMods = text => {
    props.setSearchQuery(text);
    props.loadMoreMods(null, null, text, true);
  };

  const debounced = debounce(loadMoreMods, 500);

  const onInputChange = e => {
    debounced(e.target.value);
  };

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
        onChange={onInputChange}
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
          <Select.Option value="Featured">Featured</Select.Option>
          <Select.Option value="Popularity">Popularity</Select.Option>
          <Select.Option value="LastUpdated">Last Updated</Select.Option>
          <Select.Option value="Name">Name</Select.Option>
          <Select.Option value="Author">Author</Select.Option>
          <Select.Option value="TotalDownloads">Total Downloads</Select.Option>
        </Select>
      </div>
    </div>
  );
};
