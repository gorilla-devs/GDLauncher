/* eslint-disable no-loop-func */
import React, { useState, useEffect, memo } from 'react';
import { Button, Progress, Input } from 'antd';
import { Transition } from 'react-transition-group';
import styled, { useTheme } from 'styled-components';
import { ipcRenderer } from 'electron';
import fse from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleLeft,
  faCheck,
  faExclamationTriangle,
  faFolder,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { exec } from 'child_process';
import { promisify } from 'util';
import Modal from '../components/Modal';
import { downloadFile } from '../../app/desktop/utils/downloader';
import {
  convertOSToJavaFormat,
  extractAll,
  isJavaPathOK,
  isLatestJavaDownloaded
} from '../../app/desktop/utils';
import { _getTempPath, _getJavaPath } from '../utils/selectors';
import { closeModal } from '../reducers/modals/actions';
import {
  updateJavaLatestPath,
  updateJavaPath
} from '../reducers/settings/actions';
import { UPDATE_MODAL } from '../reducers/modals/actionTypes';
import { LATEST_JAVA_VERSION } from '../utils/constants';

const JavaSetup = ({ beginChoice }) => {
  const [step, setStep] = useState(beginChoice ? 1 : 0);
  const [choice, setChoice] = useState(beginChoice || null);
  const [isJava8Downloaded, setIsJava8Downloaded] = useState(null);
  const [isJavaLatestDownloaded, setIsJavaLatestDownloaded] = useState(null);
  const [java8Log, setJava8Log] = useState('');
  const [javaLatestLog, setJavaLatestLog] = useState('');
  const userData = useSelector(state => state.userData);
  const customJava8Path = useSelector(state => state.settings.java.path);
  const customJavaLatestPath = useSelector(state => state.settings.java.latest);
  const oldJava8Path = useSelector(state => _getJavaPath(state)(8));
  const oldJavaLatestPath = useSelector(state =>
    _getJavaPath(state)(LATEST_JAVA_VERSION)
  );
  const dispatch = useDispatch();
  const theme = useTheme();
  const manifests = {
    javaLatest: useSelector(state => state.app.javaLatestManifest),
    java: useSelector(state => state.app.javaManifest)
  };

  const checkJava = (path8, pathLatest) => {
    let java8Promise;
    if (path8 && path8 !== '') java8Promise = isJavaPathOK(path8, true);
    else if (!customJava8Path || customJava8Path === '')
      java8Promise = isLatestJavaDownloaded(manifests, userData, true, 8);
    else java8Promise = isJavaPathOK(oldJava8Path, true);

    let javaLatestPromise;
    if (pathLatest && pathLatest !== '')
      javaLatestPromise = isJavaPathOK(pathLatest, true);
    else if (!customJavaLatestPath || customJavaLatestPath === '')
      javaLatestPromise = isLatestJavaDownloaded(
        manifests,
        userData,
        true,
        LATEST_JAVA_VERSION
      );
    else javaLatestPromise = isJavaPathOK(oldJavaLatestPath, true);

    java8Promise
      .then(e => {
        setIsJava8Downloaded(e?.isValid);
        return setJava8Log(e?.log);
      })
      .catch(err => console.error(err));
    javaLatestPromise
      .then(e => {
        setIsJavaLatestDownloaded(e?.isValid);
        return setJavaLatestLog(e?.log);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    checkJava();
  }, []);

  return (
    <Modal
      title="Java Setup"
      css={`
        height: 380px;
        width: 600px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 20px;
        position: relative;
      `}
      header={false}
    >
      <Transition in={step === 0} timeout={200}>
        {state => (
          <FirstStep state={state}>
            <div
              css={`
                font-size: 28px;
                text-align: center;
                margin-bottom: 20px;
              `}
            >
              Java Setup
            </div>
            <div
              css={`
                margin-bottom: 20px;
                font-size: 18px;
                text-align: justify;
              `}
            >
              For an optimal experience, we suggest letting us take care of java
              for you. Only manually manage java if you know what you&apos;re
              doing, it may result in GDLauncher not working!
            </div>

            <div
              css={`
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                opacity: 0;
                opacity: ${isJava8Downloaded !== null &&
                isJavaLatestDownloaded !== null &&
                (!isJava8Downloaded || !isJavaLatestDownloaded) &&
                '1'};
                * > h3 {
                  border-radius: 5px;
                  padding: 2px 4px;
                  background: ${props => props.theme.palette.colors.red};
                  margin-right: 5px;
                  width: 71px;
                  display: flex;
                  justify-content: center;
                  align-content: center;
                  box-sizing: content-box;
                  margin-left: 5px;
                }
              `}
            >
              <h3>Missing Versions:</h3>
              <div
                css={`
                  display: flex;
                  align-items: center;
                  margin-left: 5px;
                `}
              >
                {!isJava8Downloaded && isJava8Downloaded !== null && (
                  <h3>Java 8</h3>
                )}
                {!isJavaLatestDownloaded && isJavaLatestDownloaded !== null && (
                  <h3>Java {LATEST_JAVA_VERSION}</h3>
                )}
              </div>
            </div>

            <div
              css={`
                & > div {
                  display: flex;
                  justify-content: center;
                  margin-top: 10px;
                }
              `}
            >
              <div>
                <Button
                  type="primary"
                  css={`
                    width: 150px;
                  `}
                  onClick={() => {
                    setStep(1);
                    setChoice(1);
                  }}
                >
                  Automatic Setup
                </Button>
              </div>
              <div>
                <Button
                  type="text"
                  css={`
                    width: 150px;
                  `}
                  onClick={() => {
                    setStep(1);
                    setChoice(2);
                  }}
                >
                  Manual Setup
                </Button>
              </div>
              <div>
                <Button
                  disabled={!isJava8Downloaded || !isJava8Downloaded}
                  type="text"
                  css={`
                    width: 150px;
                  `}
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Java information
                </Button>
              </div>
            </div>
          </FirstStep>
        )}
      </Transition>
      <Transition in={step >= 1} timeout={200}>
        {state => (
          <SecondStep state={state}>
            {step === 1 ? (
              <>
                <div
                  css={`
                    font-size: 28px;
                    text-align: center;
                    margin-bottom: 20px;
                  `}
                >
                  {choice === 1 ? 'Automatic' : 'Manual'} Setup
                </div>
                {choice === 1 ? (
                  <AutomaticSetup
                    isJava8Downloaded={isJava8Downloaded}
                    isJavaLatestDownloaded={isJavaLatestDownloaded}
                    checkJava={checkJava}
                    setStep={setStep}
                  />
                ) : (
                  <ManualSetup
                    setStep={setStep}
                    checkJava={checkJava}
                    isJava8Downloaded={isJava8Downloaded}
                    setIsJava8Downloaded={setIsJava8Downloaded}
                    customJava8Path={customJava8Path}
                    isJavaLatestDownloaded={isJavaLatestDownloaded}
                    setJavaLatestDownloaded={setIsJavaLatestDownloaded}
                    customJavaLatestPath={customJavaLatestPath}
                  />
                )}{' '}
              </>
            ) : (
              <>
                <div
                  css={`
                    display: flex;
                    flex-direction: column;
                    > div {
                      display: flex;
                      flex-direction: column;
                      margin: 10px 0;
                      p {
                        margin: 0;
                      }
                    }
                  `}
                >
                  <h2>Java 8 and Java {LATEST_JAVA_VERSION} are installed!</h2>
                  <div>
                    <h3>Java 8 details:</h3>
                    <code>
                      {!java8Log || java8Log === '' ? (
                        <>
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            color={theme.palette.colors.yellow}
                          />
                          {'  '}An error occurred whilst trying to check for the
                          Java version!
                        </>
                      ) : (
                        <>
                          {java8Log
                            .split('\n')
                            .splice(0, java8Log.split('\n').length - 1)
                            .map((e, index) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <p key={index}>
                                {e}
                                <br />
                              </p>
                            ))}
                        </>
                      )}
                    </code>
                  </div>
                  <div>
                    <h3>Java {LATEST_JAVA_VERSION} details:</h3>
                    <code>
                      {!javaLatestLog || javaLatestLog === '' ? (
                        <>
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            color={theme.palette.colors.yellow}
                          />
                          {'  '}An error occurred whilst trying to check for the
                          Java version!
                        </>
                      ) : (
                        <>
                          {javaLatestLog
                            .split('\n')
                            .splice(0, javaLatestLog.split('\n').length - 1)
                            .map((e, index) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <p key={index}>
                                {e}
                                <br />
                              </p>
                            ))}
                        </>
                      )}
                    </code>
                  </div>
                </div>
                <div
                  css={`
                    position: absolute;
                    top: 0;
                    right: 0;
                    display: flex;
                    flex-direction: row;
                    div {
                      cursor: pointer;
                      width: 20px;
                      font-size: 20px;
                      display: flex;
                      justify-content: center;
                      border-radius: 3px;
                      margin: 2px;
                      transition: all 0.15s ease-in-out;
                      background-color: ${theme.palette.primary.main};
                    }
                  `}
                >
                  <div
                    css={`
                      &:hover {
                        background-color: ${theme.palette.primary.light};
                      }
                    `}
                  >
                    <FontAwesomeIcon
                      onClick={() => setStep(0)}
                      icon={faAngleLeft}
                    />
                  </div>
                  <div
                    css={`
                      &:hover {
                        background-color: ${theme.palette.error.main};
                      }
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      onClick={() => dispatch(closeModal())}
                    />
                  </div>
                </div>
              </>
            )}
          </SecondStep>
        )}
      </Transition>
    </Modal>
  );
};

const ManualSetup = ({
  setStep,
  isJava8Downloaded,
  setIsJava8Downloaded,
  customJava8Path,
  isJavaLatestDownloaded,
  setIsJavaLatestDownloaded,
  customJavaLatestPath,
  checkJava
}) => {
  const userData = useSelector(state => state.userData);
  const javaBaseFolder = path.join(userData, 'java');
  const java8Manifest = useSelector(state => state.app.javaManifest);
  const javaLatestManifest = useSelector(state => state.app.javaLatestManifest);
  const [javaPath, setJavaPath] = useState(
    path.resolve(
      useSelector(state => _getJavaPath(state)(8)),
      customJava8Path && customJava8Path !== '' ? './' : '../../'
    )
  );
  const [javaLatestPath, setJavaLatestPath] = useState(
    path.resolve(
      useSelector(state => _getJavaPath(state)(LATEST_JAVA_VERSION)),
      customJavaLatestPath && customJavaLatestPath !== '' ? './' : '../../'
    )
  );
  const [changedContent, setChangedContent] = useState(false);

  const dispatch = useDispatch();
  const theme = useTheme();
  useEffect(() => {
    if (!fse.existsSync(javaPath)) setJavaPath('');
    if (!fse.existsSync(javaLatestPath)) setJavaLatestPath('');
  }, []);
  const getJavaPath = javaVersion => {
    const javaOs = convertOSToJavaFormat(process.platform);
    const javaMeta =
      javaVersion === 8
        ? java8Manifest.find(v => v.os === javaOs)
        : javaLatestManifest.find(v => v.os === javaOs);
    const {
      version_data: { openjdk_version: version }
    } = javaMeta;

    return path.join(javaBaseFolder, version);
  };
  const defaultJava8Path = getJavaPath(8);
  const defaultJavaLatestPath = getJavaPath(LATEST_JAVA_VERSION);

  const getColor = (p, latestDownloaded) => {
    if (!fse.existsSync(p)) return '#cb6418';
    if (latestDownloaded) return '#55d90b';
    return '#D64441';
  };

  const getSymbol = (p, latestDownloaded) => {
    if (!fse.existsSync(p)) return faExclamationTriangle;
    if (latestDownloaded) return faCheck;
    return faTimes;
  };

  const ErrorMessage = () => {
    let message;
    if (!fse.existsSync(javaPath) || !fse.existsSync(javaLatestPath))
      message = 'No such file or directory';
    if (!changedContent && !isJavaLatestDownloaded)
      message = `Error checking for Java ${LATEST_JAVA_VERSION}`;
    if (!changedContent && !isJava8Downloaded)
      message = 'Error checking for Java 8';
    if (!changedContent && !isJava8Downloaded && !isJavaLatestDownloaded)
      message = `Error checking for Java 8 and ${LATEST_JAVA_VERSION}`;

    if (!message) return null;
    return (
      <span
        css={`
          margin-right: 10px;
        `}
      >
        {message}
      </span>
    );
  };

  const selectFolder = async version => {
    const { filePaths, canceled } = await ipcRenderer.invoke('openFileDialog');
    if (!canceled) {
      if (version === LATEST_JAVA_VERSION) {
        setJavaLatestPath(filePaths[0]);
      } else setJavaPath(filePaths[0]);
    }
  };
  return (
    <div
      css={`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <div
        css={`
          margin-bottom: 35px;
          font-size: 18px;
        `}
      >
        Enter the required paths to java. Java 8 will be used for all the
        versions {'<'} 1.17, java {LATEST_JAVA_VERSION} for versions {'>='}{' '}
        1.17. You can also use the same executable but some versions might not
        run.
      </div>
      {defaultJava8Path && defaultJava8Path === javaPath ? (
        <PathContainer>
          <div
            css={`
              width: 100%;
              padding: 4px 12px;
              border-radius: 2px;
              background: ${theme.palette.grey['800']};
            `}
          >
            Java 8 is already installed automatically. Delete to set manually
          </div>
          <Button
            type="danger"
            onClick={async () => {
              await fse.remove(getJavaPath(8));
              setJavaPath('');
              setIsJava8Downloaded(false);
            }}
            css={`
              margin-left: 10px;
            `}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </PathContainer>
      ) : (
        <PathContainer>
          <Input
            placeholder="Select your Java 8 executable (MC < 1.17)"
            onChange={e => {
              setIsJava8Downloaded(false);
              setChangedContent(true);
              setJavaPath(e.target.value);
            }}
            value={javaPath}
          />
          <Button
            type="primary"
            onClick={() => selectFolder(8)}
            css={`
              margin-left: 10px;
            `}
          >
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          <div
            css={`
              display: flex;
              width: 40px;
              border-radius: 4px;
              margin-left: 10px;
              justify-content: center;
              align-items: center;
            `}
          >
            <FontAwesomeIcon
              icon={getSymbol(javaPath, isJava8Downloaded)}
              color={getColor(javaPath, isJava8Downloaded)}
            />
          </div>
        </PathContainer>
      )}
      {defaultJavaLatestPath && defaultJavaLatestPath === javaLatestPath ? (
        <PathContainer>
          <div
            css={`
              width: 100%;
              padding: 4px 12px;
              border-radius: 2px;
              background: ${theme.palette.grey['800']};
            `}
          >
            Java {LATEST_JAVA_VERSION} is already installed automatically.
            Delete to set manually
          </div>
          <Button
            type="danger"
            onClick={async () => {
              await fse.remove(getJavaPath(LATEST_JAVA_VERSION));
              setJavaLatestPath('');
              setIsJavaLatestDownloaded(false);
            }}
            css={`
              margin-left: 10px;
            `}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </PathContainer>
      ) : (
        <PathContainer>
          <Input
            placeholder={`Select your Java ${LATEST_JAVA_VERSION} executable (MC >= 1.17)`}
            onChange={e => {
              setIsJavaLatestDownloaded(false);
              setChangedContent(true);
              setJavaLatestPath(e.target.value);
            }}
            value={javaLatestPath}
          />
          <Button
            type="primary"
            onClick={() => selectFolder(LATEST_JAVA_VERSION)}
            css={`
              margin-left: 10px;
            `}
          >
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          <div
            css={`
              display: flex;
              width: 40px;
              border-radius: 4px;
              margin-left: 10px;
              justify-content: center;
              align-items: center;
            `}
          >
            <FontAwesomeIcon
              icon={getSymbol(javaLatestPath, isJavaLatestDownloaded)}
              color={getColor(javaLatestPath, isJavaLatestDownloaded)}
            />
          </div>
        </PathContainer>
      )}
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 45px;
          position: absolute;
          bottom: 0;
        `}
      >
        <Button
          type="primary"
          onClick={() => {
            checkJava();
            setStep(0);
          }}
        >
          Go Back
        </Button>
        {!isJava8Downloaded || !isJavaLatestDownloaded ? (
          <div>
            <ErrorMessage />
            <Button
              type="primary"
              disabled={
                !fse.existsSync(javaPath) ||
                !fse.existsSync(javaLatestPath) ||
                ((!isJavaLatestDownloaded || !isJava8Downloaded) &&
                  !changedContent)
              }
              onClick={() => {
                checkJava(javaPath, javaLatestPath);
                setChangedContent(false);
              }}
            >
              Check Java
            </Button>
          </div>
        ) : (
          <Button
            type="danger"
            onClick={() => {
              if (javaPath !== defaultJava8Path)
                dispatch(updateJavaPath(javaPath));
              if (javaLatestPath !== defaultJavaLatestPath)
                dispatch(updateJavaLatestPath(javaLatestPath));
              setStep(2);
            }}
          >
            Continue with{' '}
            {javaPath === defaultJava8Path &&
            javaLatestPath === defaultJavaLatestPath
              ? 'Automatic '
              : 'Custom '}
            Java
          </Button>
        )}
      </div>
    </div>
  );
};

const AutomaticSetup = ({
  isJava8Downloaded,
  isJavaLatestDownloaded,
  setStep,
  checkJava
}) => {
  const [downloadPercentage, setDownloadPercentage] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState('Downloading Java');
  const [currentStepPercentage, setCurrentStepPercentage] = useState(0);
  const javaManifest = useSelector(state => state.app.javaManifest);
  const javaLatestManifest = useSelector(state => state.app.javaLatestManifest);
  const userData = useSelector(state => state.userData);
  const tempFolder = useSelector(_getTempPath);
  const modals = useSelector(state => state.modals);
  const dispatch = useDispatch();

  const theme = useTheme();
  const javaToInstall = [];
  useEffect(() => {
    if (javaToInstall.length > 0) {
      const instanceManagerModalIndex = modals.findIndex(
        x => x.modalType === 'JavaSetup'
      );

      dispatch({
        type: UPDATE_MODAL,
        modals: [
          ...modals.slice(0, instanceManagerModalIndex),
          {
            modalType: 'JavaSetup',
            modalProps: { preventClose: true }
          },
          ...modals.slice(instanceManagerModalIndex + 1)
        ]
      });
    }
  }, []);

  if (!isJava8Downloaded) javaToInstall.push(8);

  if (!isJavaLatestDownloaded) javaToInstall.push(LATEST_JAVA_VERSION);

  const installJava = async () => {
    const javaOs = convertOSToJavaFormat(process.platform);
    const java8Meta = javaManifest.find(v => v.os === javaOs);
    const javaLatestMeta = javaLatestManifest.find(
      v =>
        v.os === javaOs &&
        v.architecture === 'x64' &&
        (v.binary_type === 'jre' || v.binary_type === 'jdk')
    );

    const totalExtractionSteps = process.platform !== 'win32' ? 2 : 1;
    const totalSteps = 2 * javaToInstall.length;

    const setStepPercentage = (stepNumber, percentage) => {
      setCurrentStepPercentage(
        parseInt(percentage / totalSteps + (stepNumber * 100) / totalSteps, 10)
      );
    };

    let index = 0;
    for (const javaVersion of javaToInstall) {
      const {
        version_data: { openjdk_version: version },
        binary_link: url
      } = javaVersion === 8 ? java8Meta : javaLatestMeta;
      const javaBaseFolder = path.join(userData, 'java');

      await fse.remove(path.join(javaBaseFolder, version));
      const downloadLocation = path.join(tempFolder, path.basename(url));

      setCurrentSubStep(`Java ${javaVersion} - Downloading`);
      await downloadFile(downloadLocation, url, p => {
        ipcRenderer.invoke('update-progress-bar', p);
        setDownloadPercentage(p);
        setStepPercentage(index, p);
      });

      ipcRenderer.invoke('update-progress-bar', -1);
      index += 1;
      setDownloadPercentage(0);
      setStepPercentage(index, 0);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentSubStep(
        `Java ${javaVersion} - Extracting 1 / ${totalExtractionSteps}`
      );
      let { extractedParentDir } = await extractAll(
        downloadLocation,
        tempFolder,
        {
          $progress: true
        },
        {
          progress: percent => {
            ipcRenderer.invoke('update-progress-bar', percent);
            setDownloadPercentage(percent);
            setStepPercentage(
              index,
              process.platform === 'win32' ? percent : percent / 2
            );
          }
        }
      );

      setDownloadPercentage(0);

      await fse.remove(downloadLocation);

      // If NOT windows then tar.gz instead of zip, so we need to extract 2 times.
      if (process.platform !== 'win32') {
        ipcRenderer.invoke('update-progress-bar', -1);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentSubStep(
          `Java ${javaVersion} - Extracting 2 / ${totalExtractionSteps}`
        );

        const tempTarName = path.join(
          tempFolder,
          path.basename(url).replace('.tar.gz', '.tar')
        );

        ({ extractedParentDir } = await extractAll(
          tempTarName,
          tempFolder,
          {
            $progress: true
          },
          {
            progress: percent => {
              ipcRenderer.invoke('update-progress-bar', percent);
              setDownloadPercentage(percent);
              setStepPercentage(index, percent / 2 + 50);
            }
          }
        ));
        await fse.remove(tempTarName);
      }
      index += 1;
      setDownloadPercentage(0);
      setStepPercentage(index, 0);

      const directoryToMove =
        process.platform === 'darwin'
          ? path.join(tempFolder, extractedParentDir, 'Contents', 'Home')
          : path.join(tempFolder, extractedParentDir);
      await fse.move(directoryToMove, path.join(javaBaseFolder, version));

      await fse.remove(path.join(tempFolder, extractedParentDir));

      const ext = process.platform === 'win32' ? '.exe' : '';

      if (process.platform !== 'win32') {
        const execPath = path.join(
          javaBaseFolder,
          version,
          'bin',
          `java${ext}`
        );

        await promisify(exec)(`chmod +x "${execPath}"`);
        await promisify(exec)(`chmod 755 "${execPath}"`);
      }
    }

    dispatch(updateJavaPath(null));
    dispatch(updateJavaLatestPath(null));
    setCurrentSubStep(`Java is ready!`);
    ipcRenderer.invoke('update-progress-bar', -1);
    setDownloadPercentage(100);
    setCurrentStepPercentage(100);
    checkJava();
    setStep(2);
  };

  useEffect(() => {
    installJava();
  }, []);

  return (
    <div
      css={`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <div
        css={`
          margin-top: -15px; //cheaty way to get up to the Modal title :P
          margin-bottom: 50px;
          width: 50%;
        `}
      >
        <Progress
          percent={currentStepPercentage}
          strokeColor={theme.palette.primary.main}
          status="normal"
        />
      </div>
      <div
        css={`
          margin-bottom: 20px;
          font-size: 18px;
        `}
      >
        {currentSubStep}
      </div>
      <div
        css={`
          padding: 0 10px;
          width: 100%;
        `}
      >
        {downloadPercentage ? (
          <Progress
            percent={downloadPercentage}
            strokeColor={theme.palette.primary.main}
            status="normal"
          />
        ) : null}
      </div>
    </div>
  );
};

export default memo(JavaSetup);

const FirstStep = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'exiting' || state === 'exited' ? -100 : 0)}%
  );
`;

const SecondStep = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'entering' || state === 'entered' ? 0 : 101)}%
  );
`;

const PathContainer = styled.div`
  width: 100%;
  display: flex;
  margin: 5px;

  button {
    margin-right: 2px;
    transition: transform 0.2s ease-in-out;
    &:hover {
      transform: scale(1.1);
    }
  }
`;
