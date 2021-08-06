import React, { memo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { useDidMount } from 'rooks';
import { _getInstances } from '../../../../common/utils/selectors';
import Instance from './Instance';
import {
  launchInstance,
  setHasStartedCliInstance
} from '../../../../common/reducers/actions';

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

const Instances = () => {
  const instances = useSelector(_getInstances);
  const hasStartedCliInstance = useSelector(
    state => state.hasStartedCliInstance
  );
  const dispatch = useDispatch();

  useDidMount(async () => {
    if (hasStartedCliInstance) return;
    const instanceToLaunch = await ipcRenderer.invoke('get-instance-cli-arg');
    if (
      instanceToLaunch &&
      instances.find(instance => instance.name === instanceToLaunch)
    ) {
      dispatch(setHasStartedCliInstance(true));
      dispatch(launchInstance(instanceToLaunch));
    }
  });

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
