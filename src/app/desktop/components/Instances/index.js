import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { _getInstances } from "../../../../common/utils/selectors";
import Instance from "./Instance";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

const Instances = () => {
  const instances = useSelector(_getInstances);
  return (
    <Container>
      {instances.list.map(i => (
        <Instance key={i.name} instanceName={i.name} />
      ))}
    </Container>
  );
};

export default Instances;
