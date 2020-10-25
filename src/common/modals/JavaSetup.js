import React, { useState, useEffect } from 'react';
import { Button, Progress, Input } from 'antd';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import { closeModal } from '../reducers/modals/actions';
import { updateJavaPath } from '../reducers/settings/actions';
import sendMessage, {
  handleMessage,
  removeMessageHandler
} from '../utils/sendMessage';
import EV from '../messageEvents';

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
    const { filePaths, canceled } = await sendMessage(EV.OPEN_FILE_DIALOG);
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
  const dispatch = useDispatch();

  useEffect(() => {
    sendMessage(EV.INSTALL_JAVA)
      .then(() => {
        return dispatch(closeModal());
      })
      .catch(console.log);

    handleMessage(EV.UPDATE_JAVA_DOWNLOAD_PROGRESS, value => {
      setDownloadPercentage(value);
    });
    handleMessage(EV.UPDATE_JAVA_DOWNLOAD_STEP, value => {
      setCurrentStep(value);
    });

    // Cleanup listeners
    return () => {
      removeMessageHandler(EV.UPDATE_JAVA_DOWNLOAD_PROGRESS);
      removeMessageHandler(EV.UPDATE_JAVA_DOWNLOAD_STEP);
    };
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
