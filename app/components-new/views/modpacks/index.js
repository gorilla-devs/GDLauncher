import React from 'react';
import Input from '../../../../ui/Input';
import Select from '../../../../ui/Select';
import styled from 'styled-components';

const SortingNavbar = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  top: 0px;
  height: 41px;
  width: 100%;
  margin: 0 auto;
`;

export default () => {
  return (
    <div style={{ backgroundColor: 'transparent', height: '100%' }}>
      <SortingNavbar>
        <div
          style={{
            width: '50%',
            height: '41px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginRight: 'auto',
            marginLeft: 'auto'
          }}
        >
          <div>
            <Input placeholder="search"></Input>
          </div>
          <div
            style={{
              width: '200px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}
          >
            sort by&nbsp;
            <Select width="140px">
              <div>Featured</div>
              <div>Popularity</div>
              <div>Last Updated</div>
              <div>Name</div>
              <div>Author</div>
              <div>Total Downloads</div>
            </Select>
          </div>
        </div>
      </SortingNavbar>
    </div>
  );
};
