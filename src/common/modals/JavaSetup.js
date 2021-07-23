import React, { useState, useEffect } from 'react';
import { Button, Progress, Input } from 'antd';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import fse from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { extractFull } from 'node-7z';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { exec } from 'child_process';
import { promisify } from 'util';
import Modal from '../components/Modal';
import { downloadFile } from '../../app/desktop/utils/downloader';
import {
  convertOSToJavaFormat,
  get7zPath,
  isLatestJavaDownloaded
} from '../../app/desktop/utils';
import { _getTempPath } from '../utils/selectors';
import { closeModal } from '../reducers/modals/actions';
import { updateJava16Path, updateJavaPath } from '../reducers/settings/actions';

const JavaSetup = () => {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(null);
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
                margin-bottom: 50px;
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
                & > div {
                  display: flex;
                  justify-content: center;
                  margin-top: 30px;
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
                    setChoice(0);
                  }}
                >
                  Automatic Setup
                </Button>
              </div>
              <div>
                <Button
                  type="danger"
                  css={`
                    width: 150px;
                  `}
                  onClick={() => {
                    setStep(1);
                    setChoice(1);
                  }}
                >
                  Manual Setup
                </Button>
              </div>
            </div>
          </FirstStep>
        )}
      </Transition>
      <Transition in={step === 1} timeout={200}>
        {state => (
          <SecondStep state={state}>
            <div
              css={`
                font-size: 28px;
                text-align: center;
                margin-bottom: 20px;
              `}
            >
              {choice === 0 ? 'Automatic' : 'Manual'} Setup
            </div>
            {choice === 0 ? (
              <AutomaticSetup />
            ) : (
              <ManualSetup setChoice={setChoice} />
            )}
          </SecondStep>
        )}
      </Transition>
    </Modal>
  );
};

const ManualSetup = ({ setChoice }) => {
  const [javaPath, setJavaPath] = useState('');
  const [java16Path, setJava16Path] = useState('');
  const dispatch = useDispatch();

  const selectFolder = async version => {
    const { filePaths, canceled } = await ipcRenderer.invoke('openFileDialog');
    if (!canceled) {
      if (version === 16) {
        setJava16Path(filePaths[0]);
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
          margin-bottom: 50px;
          font-size: 18px;
        `}
      >
        Select your java executable. We strongly suggest Java8, since any other
        version won&apos;t completely work with modded Minecraft
      </div>
      <div
        css={`
          width: 100%;
          display: flex;
          margin-bottom: 10px;
        `}
      >
        <Input
          placeholder="Select your java executable"
          onChange={e => setJavaPath(e.target.value)}
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
      </div>
      <div
        css={`
          width: 100%;
          display: flex;
        `}
      >
        <Input
          placeholder="Select your java16 executable"
          onChange={e => setJava16Path(e.target.value)}
          value={java16Path}
        />
        <Button
          type="primary"
          onClick={() => selectFolder(16)}
          css={`
            margin-left: 10px;
          `}
        >
          <FontAwesomeIcon icon={faFolder} />
        </Button>
      </div>
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
        `}
      >
        <Button type="primary" onClick={() => setChoice(0)}>
          Go to Automatic Setup instead
        </Button>
        <Button
          type="danger"
          disabled={javaPath === '' || java16Path === ''}
          onClick={() => {
            dispatch(updateJavaPath(javaPath));
            dispatch(updateJava16Path(java16Path));
            dispatch(closeModal());
          }}
        >
          Continue with custom java
        </Button>
      </div>
    </div>
  );
};

const AutomaticSetup = () => {
  const [downloadPercentage, setDownloadPercentage] = useState(null);
  const [currentStep, setCurrentStep] = useState('Downloading Java');
  const [currentStepPercentage, setCurrentStepPercentage] = useState(null);
  const javaManifest = useSelector(state => state.app.javaManifest);
  const java16Manifest = useSelector(state => state.app.java16Manifest);
  const userData = useSelector(state => state.userData);
  const tempFolder = useSelector(_getTempPath);
  const dispatch = useDispatch();

  const installJava = async () => {
    const javaOs = convertOSToJavaFormat(process.platform);
    const javaMeta = javaManifest.find(v => v.os === javaOs);
    const java16Meta = java16Manifest.find(v => v.os === javaOs);
    const manifests = {
      java16: java16Manifest,
      java: javaManifest
    };

    const isJava8Downloaded = await isLatestJavaDownloaded(
      manifests,
      userData,
      true
    );
    const isJava16Downloaded = await isLatestJavaDownloaded(
      manifests,
      userData,
      true
    );
    const {
      version_data: { openjdk_version: version },
      binary_link: url,
      release_name: releaseName
    } = javaMeta;

    const {
      version_data: { openjdk_version: version16 },
      binary_link: url16,
      release_name: releaseName16
    } = java16Meta;

    const javaBaseFolder = path.join(userData, 'java');
    await fse.remove(javaBaseFolder);
    const downloadLocation = path.join(tempFolder, path.basename(url));
    const downloadjava16Location = path.join(tempFolder, path.basename(url16));

    if (!isJava8Downloaded) {
      setCurrentStep('Java8 - Downloading');
      await downloadFile(downloadLocation, url, p => {
        ipcRenderer.invoke('update-progress-bar', parseInt(p, 10) / 100);
        setDownloadPercentage(parseInt(p, 10));
        setCurrentStepPercentage(p / (100 / 27.5), 10);
      });
    }
    if (!isJava16Downloaded) {
      setCurrentStep('Java16 - Downloading');
      await downloadFile(downloadjava16Location, url16, p => {
        ipcRenderer.invoke('update-progress-bar', parseInt(p, 10) / 100);
        setDownloadPercentage(parseInt(p, 10));
        setCurrentStepPercentage(27.5 + p / (100 / 27.5), 10);
      });
    }
    ipcRenderer.invoke('update-progress-bar', -1);
    setDownloadPercentage(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalSteps = process.platform !== 'win32' ? 2 : 1;
    const sevenZipPath = await get7zPath();
    if (!isJava8Downloaded) {
      setCurrentStep(`Java8 - Extracting 1 / ${totalSteps}`);
      const firstExtraction = extractFull(downloadLocation, tempFolder, {
        $bin: sevenZipPath,
        $progress: true
      });
      await new Promise((resolve, reject) => {
        firstExtraction.on('progress', ({ percent }) => {
          ipcRenderer.invoke('update-progress-bar', percent);
          setDownloadPercentage(percent);
          setCurrentStepPercentage(
            27.5 + 27,
            5 + percent / (100 / totalSteps === 2 ? 10 : 20)
          );
        });
        firstExtraction.on('end', () => {
          resolve();
        });
        firstExtraction.on('error', err => {
          reject(err);
        });
      });

      await fse.remove(downloadLocation);
    }
    if (!isJava16Downloaded) {
      setCurrentStep(`Java16 - Extracting 1 / ${totalSteps}`);
      const firstExtractionJava16 = extractFull(
        downloadjava16Location,
        tempFolder,
        {
          $bin: sevenZipPath,
          $progress: true
        }
      );

      console.log('sevenZip', sevenZipPath);

      await new Promise((resolve, reject) => {
        firstExtractionJava16.on('progress', ({ percent }) => {
          ipcRenderer.invoke('update-progress-bar', percent);
          setDownloadPercentage(percent);
          setCurrentStepPercentage(
            27.5 +
              27.5 +
              (totalSteps === 2 ? 10 : 27.5) +
              percent / (100 / (totalSteps === 2 ? 10 : 20))
          );
        });
        firstExtractionJava16.on('end', () => {
          resolve();
        });
        firstExtractionJava16.on('error', err => {
          reject(err);
        });
      });
    }

    await fse.remove(downloadjava16Location);

    // If NOT windows then tar.gz instead of zip, so we need to extract 2 times.
    if (process.platform !== 'win32') {
      ipcRenderer.invoke('update-progress-bar', -1);
      setDownloadPercentage(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isJava8Downloaded) {
        setCurrentStep(`Java8 - Extracting 2 / ${totalSteps}`);

        const tempTarName = path.join(
          tempFolder,
          path.basename(url).replace('.tar.gz', '.tar')
        );

        const secondExtraction = extractFull(tempTarName, tempFolder, {
          $bin: sevenZipPath,
          $progress: true
        });
        await new Promise((resolve, reject) => {
          secondExtraction.on('progress', ({ percent }) => {
            ipcRenderer.invoke('update-progress-bar', percent);
            setDownloadPercentage(percent);
            setCurrentStepPercentage(
              27.5 + 27.5 + 10 + 10 + percent / (100 / 10)
            );
          });
          secondExtraction.on('end', () => {
            resolve();
          });
          secondExtraction.on('error', err => {
            reject(err);
          });
        });

        await fse.remove(tempTarName);
      }
      if (!isJava16Downloaded) {
        setCurrentStep(`Java16 - Extracting 2 / ${totalSteps}`);
        const tempTarName16 = path.join(
          tempFolder,
          path.basename(url16).replace('.tar.gz', '.tar')
        );

        const secondExtractionJava16 = extractFull(tempTarName16, tempFolder, {
          $bin: sevenZipPath,
          $progress: true
        });
        await new Promise((resolve, reject) => {
          secondExtractionJava16.on('progress', ({ percent }) => {
            ipcRenderer.invoke('update-progress-bar', percent);
            setDownloadPercentage(percent);
            setCurrentStepPercentage(
              27.5 + 27.5 + 10 + 10 + 10 + percent / (100 / 10)
            );
          });
          secondExtractionJava16.on('end', () => {
            resolve();
          });
          secondExtractionJava16.on('error', err => {
            reject(err);
          });
        });
        await fse.remove(tempTarName16);
      }
    }

    setCurrentStep('Cleanup');
    setCurrentStepPercentage(95);

    const directoryToMove =
      process.platform === 'darwin'
        ? path.join(tempFolder, `${releaseName}-jre`, 'Contents', 'Home')
        : path.join(tempFolder, `${releaseName}-jre`);
    await fse.move(directoryToMove, path.join(javaBaseFolder, version));

    await fse.remove(path.join(tempFolder, `${releaseName}-jre`));

    const ext = process.platform === 'win32' ? '.exe' : '';

    const directoryToMove16 =
      process.platform === 'darwin'
        ? path.join(tempFolder, `${releaseName16}-jre`, 'Contents', 'Home')
        : path.join(tempFolder, `${releaseName16}-jre`);
    await fse.move(directoryToMove16, path.join(javaBaseFolder, version16));

    await fse.remove(path.join(tempFolder, `${releaseName16}-jre`));

    if (process.platform !== 'win32') {
      const execPath = path.join(javaBaseFolder, version, 'bin', `java${ext}`);

      await promisify(exec)(`chmod +x "${execPath}"`);
      await promisify(exec)(`chmod 755 "${execPath}"`);

      const execPath16 = path.join(
        javaBaseFolder,
        version16,
        'bin',
        `java${ext}`
      );

      await promisify(exec)(`chmod +x "${execPath16}"`);
      await promisify(exec)(`chmod 755 "${execPath16}"`);
    }

    dispatch(updateJavaPath(null));
    dispatch(updateJava16Path(null));
    setCurrentStep(`Java is ready!`);
    ipcRenderer.invoke('update-progress-bar', -1);
    setDownloadPercentage(null);
    setCurrentStepPercentage(100);
    await new Promise(resolve => setTimeout(resolve, 2000));
    dispatch(closeModal());
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
        {currentStepPercentage ? (
          <Progress percent={currentStepPercentage} showInfo={false} />
        ) : null}
      </div>
      <div
        css={`
          margin-bottom: 50px;
          font-size: 18px;
        `}
      >
        {currentStep}
      </div>
      {downloadPercentage ? <Progress percent={downloadPercentage} /> : null}
    </div>
  );
};

export default JavaSetup;

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
