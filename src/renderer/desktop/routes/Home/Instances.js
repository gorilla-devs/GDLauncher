import React, { memo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Instance from './Instance';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
`;

const NoInstance = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 25px;
  margin-top: 100px;
`;

const SubNoInstance = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 15px;
  margin-top: 20px;
`;

const Instances = () => {
  const instances = useSelector(state => Object.keys(state.instances.list));

  return (
    <Container>
      {instances.length > 0 ? (
        instances.map(i => <Instance key={i} uid={i} />)
      ) : (
        <NoInstance>
          No Instance has been installed
          <SubNoInstance>
            Click on the icon in the bottom left corner to add new instances
          </SubNoInstance>
        </NoInstance>
      )}
    </Container>
  );
};

export default memo(Instances);
