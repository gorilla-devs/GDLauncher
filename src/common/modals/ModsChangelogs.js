/* eslint-disable react/no-unescaped-entities */
import React, { memo } from 'react';
import styled from 'styled-components';
import ReactHtmlParser from 'react-html-parser';
import Modal from '../components/Modal';

const ModsChangeLogs = ({ changeLog }) => {
  return (
    <Modal
      css={`
        height: 500px;
        width: 650px;
      `}
      title="Changelog"
    >
      <Changelog>
        {changeLog ? (
          ReactHtmlParser(changeLog)
        ) : (
          <h2
            css={`
              text-align: center;
            `}
          >
            Missing Changelog
          </h2>
        )}
      </Changelog>
    </Modal>
  );
};

export default memo(ModsChangeLogs);

const Changelog = styled.div`
  perspective: 1px;
  transform-style: preserve-3d;
  height: calc(100% - 10px);
  background: ${props => props.theme.palette.grey[900]};
  word-break: break-all;
  overflow-x: hidden;
  overflow-y: scroll;
  font-size: 20px;
  & > div:first-child {
    font-size: 24px;
    width: 100%;
    text-align: center;
    margin-bottom: 30px;
  }
  p {
    text-align: center;
  }
  img {
    max-width: 100%;
    height: auto;
  }
`;
