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
import { convertOSToJavaFormat, get7zPath } from '../../app/desktop/utils';
import { _getTempPath } from '../utils/selectors';
import { closeModal } from '../reducers/modals/actions';
import { updateJavaPath } from '../reducers/settings/actions';

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
  const dispatch = useDispatch();

  const selectFolder = async () => {
    const { filePaths, canceled } = await ipcRenderer.invoke('openFileDialog');
    if (!canceled) {
      setJavaPath(filePaths[0]);
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
        `}
      >
        <Input
          placeholder="Select your java executable"
          onChange={e => setJavaPath(e.target.value)}
          value={javaPath}
        />
        <Button
          type="primary"
          onClick={selectFolder}
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
          margin-top: 70px;
        `}
      >
        <Button type="primary" onClick={() => setChoice(0)}>
          Go to Automatic Setup instead
        </Button>
        <Button
          type="danger"
          disabled={javaPath === ''}
          onClick={() => {
            dispatch(updateJavaPath(javaPath));
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
  const javaManifest = useSelector(state => state.app.javaManifest);
  const userData = useSelector(state => state.userData);
  const tempFolder = useSelector(_getTempPath);
  const dispatch = useDispatch();

  const installJava = async () => {
    const javaOs = convertOSToJavaFormat(process.platform);
    const javaMeta = javaManifest.find(v => v.os === javaOs);
    const {
      version_data: { openjdk_version: version },
      binary_link: url,
      release_name: releaseName
    } = javaMeta;
    const javaBaseFolder = path.join(userData, 'java');
    await fse.remove(javaBaseFolder);
    const downloadLocation = path.join(tempFolder, path.basename(url));

    await downloadFile(downloadLocation, url, p => {
      ipcRenderer.invoke('update-progress-bar', parseInt(p, 10));
      setDownloadPercentage(parseInt(p, 10));
    });

    ipcRenderer.invoke('update-progress-bar', -1);
    setDownloadPercentage(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalSteps = process.platform !== 'win32' ? 2 : 1;

    setCurrentStep(`Extracting 1 / ${totalSteps}`);
    const sevenZipPath = await get7zPath();
    const firstExtraction = extractFull(downloadLocation, tempFolder, {
      $bin: sevenZipPath,
      $progress: true
    });
    await new Promise((resolve, reject) => {
      firstExtraction.on('progress', ({ percent }) => {
        ipcRenderer.invoke('update-progress-bar', percent);
        setDownloadPercentage(percent);
      });
      firstExtraction.on('end', () => {
        resolve();
      });
      firstExtraction.on('error', err => {
        reject(err);
      });
    });

    await fse.remove(downloadLocation);

    // If NOT windows then tar.gz instead of zip, so we need to extract 2 times.
    if (process.platform !== 'win32') {
      ipcRenderer.invoke('update-progress-bar', -1);
      setDownloadPercentage(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(`Extracting 2 / ${totalSteps}`);
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

    const directoryToMove =
      process.platform === 'darwin'
        ? path.join(tempFolder, `${releaseName}-jre`, 'Contents', 'Home')
        : path.join(tempFolder, `${releaseName}-jre`);
    await fse.move(directoryToMove, path.join(javaBaseFolder, version));

    await fse.remove(path.join(tempFolder, `${releaseName}-jre`));

    const ext = process.platform === 'win32' ? '.exe' : '';

    if (process.platform !== 'win32') {
      const execPath = path.join(javaBaseFolder, version, 'bin', `java${ext}`);

      await promisify(exec)(`chmod +x "${execPath}"`);
      await promisify(exec)(`chmod 755 "${execPath}"`);
    }

    dispatch(updateJavaPath(null));
    setCurrentStep(`Java is ready!`);
    ipcRenderer.invoke('update-progress-bar', -1);
    setDownloadPercentage(null);
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
