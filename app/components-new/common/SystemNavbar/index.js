// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import WindowCloseBtn from './components/WindowCloseButton';
import WindowMinimizeBtn from './components/WindowMinimizeButton';
import WindowHideBtn from './components/WindowHideButton';
import OpenDevTools from './components/OpenDevTools';

const Container = styled.div`
  margin: 0;
  width: 100%;
  height: 23px;
  padding-left: 10px;
  background: ${props => props.theme.palette.grey[900]};
  -webkit-app-region: drag;
  -webkit-user-select: none;
  z-index: 100000;
`;

type Props = {};
export default function SystemNavBar(props) {
  return (
    <Container>
      <OpenDevTools />
      <WindowCloseBtn />
      <WindowMinimizeBtn />
      <WindowHideBtn />
    </Container>
  );
}
