import React from "react";
import { transparentize } from "polished";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { _getInstance } from "../../../../common/utils/selectors";
import { launchInstance } from "../../../../common/reducers/actions";

const Container = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 180px;
  height: 100px;
  background: ${p => p.theme.palette.grey[500]};
  border-radius: 4px;
  margin: 10px;
  cursor: pointer;
  transform: scale3d(1, 1, 1);
  transition: transform 150ms ease-in-out;
  &:after {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 800;
    transition: opacity 150ms ease-in-out;
    width: 100%;
    height: 100%;
    opacity: 0;
    backdrop-filter: blur(4px);
    will-change: opacity;
    background: ${p => transparentize(0.4, p.theme.palette.grey[700])};
    content: "PLAY";
  }
  &:hover {
    transform: scale3d(1.1, 1.1, 1.1);
    &:after {
      opacity: 1;
    }
  }
`;

const Instance = ({ instanceName }) => {
  const dispatch = useDispatch();
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const startInstance = () => {
    dispatch(launchInstance(instanceName));
  };
  return <Container onClick={startInstance}>{instance.name}</Container>;
};

export default Instance;
