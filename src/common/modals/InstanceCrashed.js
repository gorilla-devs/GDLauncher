import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { clipboard } from 'electron';
import { Tooltip, Collapse } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/Modal';
import Logo from '../../ui/LogoSad';

const calcError = code => {
  switch (code) {
    case 1:
      return 'Uncaught Fatal Exception';
    case 3:
      return 'Internal JavaScript Parse Error';
    case 4:
      return 'Internal JavaScript Evaluation Failure';
    case 5:
      return 'Fatal Error';
    case 6:
      return 'Non-function Internal Exception Handler ';
    case 7:
      return 'Internal Exception Handler Run-Time Failure';
    case 9:
      return 'Invalid Argument';
    case 10:
      return 'Internal JavaScript Run-Time Failure';
    case 12:
      return 'Invalid Debug Argument';
    default:
      return code > 128 ? 'Signal Exits' : 'Unknown Error';
  }
};

const { Panel } = Collapse;

const InstanceCrashed = ({ code, errorLogs }) => {
  const [copiedLog, setCopiedLog] = useState(null);

  function copy(e) {
    e.stopPropagation();
    setCopiedLog(true);
    clipboard.writeText(errorLogs);
    setTimeout(() => {
      setCopiedLog(false);
    }, 500);
  }

  return (
    <Modal
      css={`
        height: 450px;
        width: 500px;
      `}
      title="The instance could not be launched"
    >
      <Container>
        <InnerContainer>
          <Logo size={100} />
          <h3>
            OOPSIE WOOPSIE!!
            <br /> A creeper blew this instance up!
          </h3>
        </InnerContainer>
        <Card
          css={`
            margin: 10px 0 20px 0;
          `}
        >
          <h3>Error: </h3>
          <ErrorContainer>{calcError(code)}</ErrorContainer>
          <h3>code: </h3>
          <ErrorContainer>{code}</ErrorContainer>
        </Card>
        <Collapse
          css={`
            width: 100%;
          `}
          defaultActiveKey={['1']}
        >
          <Panel
            header={
              <div
                css={`
                  display: flex;
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;
                `}
              >
                Error Log &nbsp;
                <Tooltip title={copiedLog ? 'Copied' : 'Copy'} placement="top">
                  <div
                    css={`
                      margin: 0;
                    `}
                  >
                    <FontAwesomeIcon icon={faCopy} onClick={e => copy(e)} />
                  </div>
                </Tooltip>
              </div>
            }
            key="1"
          >
            <p
              css={`
                height: 110px;
                word-break: break-all;
                overflow-y: auto;
              `}
            >
              {errorLogs}
            </p>
          </Panel>
        </Collapse>
      </Container>
    </Modal>
  );
};

export default memo(InstanceCrashed);

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-conter: space-between;
  align-items: center;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;

const InnerContainer = styled.div`
  width: 100%;
  display: flex;
  justify-conter: space-between;
  align-items: center;
  h3 {
    margin-left: 10px;
    text-align: start;
  }
  color: ${props => props.theme.palette.text.primary};
`;

const Card = styled.div`
  width: 100%;
  display: flex;
  justify-conter: space-between;
  align-items: center;
  padding: 5px;
  h3 {
    margin: 0 10px 0 10px;
    text-align: start;
    font-weight: 900;
  }
  background: ${props => props.theme.palette.grey[900]};
  color: ${props => props.theme.palette.text.primary};
`;

const ErrorContainer = styled.div`
  color: ${props => props.theme.palette.text.primary};
`;
