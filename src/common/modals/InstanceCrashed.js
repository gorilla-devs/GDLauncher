import React, { useEffect, memo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { clipboard } from 'electron';
import { Tooltip, Collapse } from 'antd';
import makeDir from 'make-dir';
import { promises as fs, watch } from 'fs';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faShare } from '@fortawesome/free-solid-svg-icons';
import { pasteBinPost } from '../api';
import { _getInstancesPath } from '../utils/selectors';

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

const InstanceCrashed = ({ instanceName, code, errorLogs }) => {
  const [copiedLog, setCopiedLog] = useState(null);
  const [crashLog, setCrashLog] = useState(null);
  const instancesPath = useSelector(_getInstancesPath);
  const instancePath = path.join(instancesPath, instanceName);
  const crashReportsPath = path.join(instancePath, 'crash-reports');

  let watcher;

  const scanCrashReports = async () => {
    await makeDir(crashReportsPath);
    try {
      const files = await fs.readdir(crashReportsPath);
      await Promise.all(
        files.map(async element => {
          const stats = await fs.stat(path.join(crashReportsPath, element));
          const fileBirthdate = new Date(stats.birthtimeMs);
          const timeDiff = Date.now() - fileBirthdate;
          const seconds = parseInt(Math.floor(timeDiff / 1000), 10);
          if (seconds <= 3) {
            const crashReport = await fs.readFile(
              path.join(crashReportsPath, element)
            );
            setCrashLog(crashReport.toString());
          }
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const readCrashReport = async () => {
    scanCrashReports();
    if (watcher) {
      await watcher.stop();
      watcher = null;
    }
    watcher = await watch(crashReportsPath, async () => {
      scanCrashReports();
    });
  };

  useEffect(() => {
    readCrashReport();
    return () => watcher?.close();
  }, []);

  async function share(e, content) {
    e.stopPropagation();

    const res = await pasteBinPost(content);

    if (res.status === 200) {
      setCopiedLog(true);
      clipboard.writeText(res.data);
      setTimeout(() => {
        setCopiedLog(false);
      }, 500);
    }
  }

  function copy(e, content) {
    e.stopPropagation();
    setCopiedLog(true);
    clipboard.writeText(content);
    setTimeout(() => {
      setCopiedLog(false);
    }, 500);
  }

  return (
    <Modal
      css={`
        height: 580px;
        width: 630px;
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
          accordion
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
                key="1"
              >
                <>Error Log</> &nbsp;
                <div
                  css={`
                    display: flex;
                  `}
                >
                  <Tooltip
                    title={copiedLog ? 'Copied Link' : 'Share'}
                    placement="top"
                  >
                    <div
                      css={`
                        margin: 0;
                      `}
                    >
                      <FontAwesomeIcon
                        css={`
                          margin: 0 20px;
                        `}
                        icon={faShare}
                        onClick={e => share(e, errorLogs)}
                      />
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={copiedLog ? 'Copied' : 'Copy'}
                    placement="top"
                  >
                    <div
                      css={`
                        margin: 0;
                      `}
                    >
                      <FontAwesomeIcon
                        icon={faCopy}
                        onClick={e => copy(e, errorLogs)}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
            }
            key="1"
          >
            <div
              css={`
                height: 100px;
                word-break: break-all;
                overflow-y: auto;
              `}
            >
              <p>{errorLogs || 'Unknown Error'}</p>
            </div>
          </Panel>
          <Panel
            header={
              <div
                css={`
                  display: flex;
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;
                `}
                key="1"
              >
                <>Crash Log</> &nbsp;
                <div
                  css={`
                    display: flex;
                  `}
                >
                  <Tooltip
                    title={copiedLog ? 'Copied Link' : 'Share'}
                    placement="top"
                  >
                    <div
                      css={`
                        margin: 0;
                      `}
                    >
                      <FontAwesomeIcon
                        css={`
                          margin: 0 20px;
                        `}
                        icon={faShare}
                        onClick={e => share(e, crashLog)}
                      />
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={copiedLog ? 'Copied' : 'Copy'}
                    placement="top"
                  >
                    <div
                      css={`
                        margin: 0;
                      `}
                    >
                      <FontAwesomeIcon
                        icon={faCopy}
                        onClick={e => copy(e, crashLog)}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
            }
            key="2"
          >
            <div
              css={`
                max-height: 200px;
                overflow: auto;
              `}
            >
              <pre
                css={`
                  word-break: break-all;
                  text-align: start;
                `}
              >
                {crashLog || 'No crash log found'}
              </pre>
            </div>
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
