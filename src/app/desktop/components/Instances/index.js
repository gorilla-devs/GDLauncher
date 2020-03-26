import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { _getInstances } from '../../../../common/utils/selectors';
import Instance from './Instance';
import * as ActionTypes from '../../../../common/reducers/actionTypes';

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
  const dispatch = useDispatch();
  const [draggedInstance, setDraggedInstance] = useState(null);

  const handleDragStart = (e, instance) => {
    setDraggedInstance(instance);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.target, 20, 20);
  };

  const handleDragOver = async (e, instance, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedInstance === instance) {
      return;
    }

    const draggedInstanceIndex = instances.indexOf(draggedInstance);
    const reorderedInstances = [...instances];
    [reorderedInstances[index], reorderedInstances[draggedInstanceIndex]] = [
      reorderedInstances[draggedInstanceIndex],
      reorderedInstances[index]
    ];
    await dispatch({
      type: ActionTypes.REORDER_INSTANCES,
      instances: reorderedInstances
    });
  };

  const handleDragEnd = () => {
    setDraggedInstance(null);
  };

  return (
    <Container>
      {instances.length > 0 ? (
        instances.map((instance, index) => (
          <Instance
            key={instance.name}
            instanceName={instance.name}
            handleDragStart={e => handleDragStart(e, instance)}
            handleDragOver={e => handleDragOver(e, instance, index)}
            handleDragEnd={handleDragEnd}
          />
        ))
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

export default Instances;
