import React, { useState } from 'react';
import { Input, Select, Button } from 'antd';
import { debounce } from 'lodash';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

export default React.memo(props => {
  const [mounted, setMounted] = useState(true);
  const loadMoreMods = text => {
    props.setSearchQuery(text);
    props.loadMoreMods(null, null, text, true);
  };
  const debounced = debounce(loadMoreMods, 500);

  const onInputChange = e => {
    debounced(e.target.value);
  };

  return (
    <Transition in={mounted} timeout={{ enter: 100, exit: 0 }} appear key="1">
      {state => (
        <div
          style={{
            height: 40,
            width: '100%',
            transition: 'transform 0.2s ease-in-out',
            background: 'var(--secondary-color-2)',
            display: 'flex'
          }}
        >
          <Link
            to={{
              pathname: `/editInstance/${props.instance}/mods/local/${
                props.version
              }`,
              state: { modal: true }
            }}
            replace
          >
            <Button
              type="primary"
              style={{
                height: 40,
                marginLeft: state === 'entered' ? 0 : -50,
                transition: 'all 0.2s ease-in-out',
                borderRadius: 0
              }}
            >
              <FontAwesomeIcon icon="chevron-left" />
            </Button>
          </Link>
          <Input
            placeholder="Search a mod"
            onChange={onInputChange}
            // onPressEnter={onSearchSubmit}
            style={{ height: 40 }}
            // value={searchQuery}
            allowClear
            disabled={props.loading === true}
          />
          <div style={{ padding: '0 5px', height: 40, marginTop: 3 }}>
            <Select
              defaultValue={props.filter}
              onChange={props.setFilter}
              style={{ width: 150, height: 40 }}
              disabled={props.loading === true}
            >
              <Select.Option value="Featured">Featured</Select.Option>
              <Select.Option value="Popularity">Popularity</Select.Option>
              <Select.Option value="LastUpdated">Last Updated</Select.Option>
              <Select.Option value="Name">Name</Select.Option>
              <Select.Option value="Author">Author</Select.Option>
              <Select.Option value="TotalDownloads">Downloads</Select.Option>
            </Select>
          </div>
        </div>
      )}
    </Transition>
  );
});
