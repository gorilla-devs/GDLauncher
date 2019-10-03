import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { updateShowChangelog } from 'reducers/settings/actions';
import store from '../../localStore';
import Modal from 'components/common/Modal';

// const Container = styled.div`
//   width: 100%;
//   height: 100%;
//   text-align: center;
// `;

export default props => {
  return (
    <Modal title={`LoginHelperModal`} height="70vh" width="600px">
      LoginHelperModal
    </Modal>
  );
};
