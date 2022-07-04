import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';

const MessageContainer = styled.div`
  width: 280px;
  height: 30px;
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  color: ${props => props.theme.palette.text.primary};
  background: ${props => props.theme.palette.grey[800]};
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  z-index: 10000000;
  border-radius: 5px;
  transition: opacity 200ms ease-in-out;
  opacity: ${props => props.visible};
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
`;

const Message = () => {
  const currentState = useSelector(state => state.message);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!currentState) {
      setVisible(false);
      return;
    }

    setVisible(true);
    if (currentState.duration !== 0) {
      setTimeout(() => {
        setVisible(false);
      }, currentState.duration);
    }
  }, [currentState]);

  return (
    <MessageContainer visible={visible ? 1 : 0}>
      {currentState?.content} <LoadingOutlined />
    </MessageContainer>
  );
};

export default memo(Message);
