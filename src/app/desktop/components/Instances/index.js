import React, { memo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { _getInstances } from '../../../../common/utils/selectors';
import Instance from './Instance';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

const NoInstance = styled.div`
  width: 100%;
  text-align: center;
  font-size: 25px;
  margin-top: 100px;
`;

const SubNoInstance = styled.div`
  width: 100%;
  text-align: center;
  font-size: 15px;
  margin-top: 20px;
`;
const sortAlphabetical = instances =>
  instances.sort((a, b) => (a.name > b.name ? 1 : -1));

const sortByLastPlayed = instances =>
  instances.sort((a, b) => (a.lastPlayed < b.lastPlayed ? 1 : -1));

const sortByMostPlayed = instances =>
  instances.sort((a, b) => (a.timePlayed < b.timePlayed ? 1 : -1));

const getInstances = () => {
  // Data normalization for missing fields
  const instances = useSelector(_getInstances).map(instance => {
    return {
      ...instance,
      timePlayed: instance.timePlayed || 0,
      lastPlayed: instance.lastPlayed || 0
    };
  });
  const instanceSortOrder = useSelector(
    state => state.settings.instanceSortOrder
  );

  switch (instanceSortOrder) {
    case 0:
      return sortAlphabetical(instances);
    case 1:
      return sortByLastPlayed(instances);
    case 2:
      return sortByMostPlayed(instances);
    default:
      return instances;
  }
};

const Instances = () => {
  const instances = getInstances();

  return (
    <Container>
      {instances.length > 0 ? (
        instances.map(i => <Instance key={i.name} instanceName={i.name} />)
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
