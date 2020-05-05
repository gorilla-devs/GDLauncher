/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { Button } from 'antd';
import { exec } from 'sudo-prompt';
import childProcess from 'child_process';
import { promisify } from 'util';
import log from 'electron-log';
import { closeModal } from '../reducers/modals/actions';
import { updateJavaOption } from '../reducers/actions';
import Modal from '../components/Modal';

const JavaOptionsFixModal = () => {
  const [finished, setFinished] = useState(false);
  const [fixing, setFixing] = useState(false);
  const dispatch = useDispatch();

  const fixJavaProblem = async () => {
    setFixing(true);
    if (process.platform === 'win32') {
      try {
        // Deletes the _JAVA_OPTIONS from the system register
        await promisify(
          exec
        )(
          `REG delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /F /V _JAVA_OPTIONS`,
          { name: 'GDLauncher Java Fixer' }
        );
      } catch (err) {
        if (typeof err === 'string') {
          log.warn('You need to confirm UAC dialog to proceed');
          setFixing(false);
          log.error(err);
          return;
        }
        log.error(err.message);
      } finally {
        try {
          // Removes the _JAVA_OPTIONS and sets it to empty in the user registry to apply it without rebooting
          await promisify(childProcess.exec)(
            'SETX _JAVA_OPTIONS "" & REG delete HKCU\\Environment /F /V _JAVA_OPTIONS'
          );
        } catch (e) {
          console.err(e);
        }
      }
    } else {
      try {
        // unset _JAVA_OPTIONS should be enough
        await promisify(childProcess.exec)('unset _JAVA_OPTIONS');
      } catch (e) {
        console.err(e);
      }
    }
    setFixing(false);
    setFinished(true);
    dispatch(updateJavaOption(false));
    dispatch(closeModal());
  };

  return (
    <Modal
      css={`
        height: 500px;
        width: 500px;
      `}
      title="Java Fix"
    >
      {finished === true ? (
        <FinishedContainer>
          <div>
            <h1>All Done! We Fixed The Issue!</h1>
            <div>
              For changes to apply you need to manually reopen the launcher
              <br /> Happy Gaming!
            </div>
            <RestartButton
              type="primary"
              onClick={() => {
                ipcRenderer.invoke('appRestart');
              }}
            >
              Exit Launcher
            </RestartButton>
          </div>
        </FinishedContainer>
      ) : (
        <>
          <MainContainer>
            Hey, we are sorry to tell you that we found a problem in your java
            installation. The good news is that we can fix it <br /> <br />
            We highly recommend fixing it since it can cause multiple errors
            with the game. <br /> <br />
            Do you want us to unset the _JAVA_OPTIONS global variable from your
            system?
            <br /> We may ask for Administrator Privileges
            <br />
            <br />
            <div>
              <b>If you are unsure</b> about what _JAVA_OPTIONS is, just click "
              <b>Fix It</b>".
            </div>
          </MainContainer>
          <Buttons>
            <Button onClick={() => fixing || dispatch(closeModal())}>
              No, I Like It This Way
            </Button>
            <Button type="primary" loading={fixing} onClick={fixJavaProblem}>
              Yes, Fix It
            </Button>
          </Buttons>
        </>
      )}
    </Modal>
  );
};

export default JavaOptionsFixModal;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15px 20px 30px;
  font-size: 16px;

  div {
    width: 100%;
    text-align: center;
    font-size: 18px;
  }
`;

const Buttons = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
  }
`;

const FinishedContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  h1 {
    color: $green;
  }
  div {
    font-size: 20px;
  }
`;

const RestartButton = styled.div`
  margin-top: 80px;
`;
