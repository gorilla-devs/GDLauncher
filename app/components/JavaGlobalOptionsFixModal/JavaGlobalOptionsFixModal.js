import React, { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import log from 'electron-log';
import { platform } from 'os';
import { remote } from 'electron';
import { exec } from 'sudo-prompt';
import childProcess from 'child_process';
import { promisify } from 'util';
import store from '../../localStore';
import styles from './JavaGlobalOptionsFixModal.scss';
import Modal from '../Common/Modal/Modal';
import { PACKS_PATH, WINDOWS } from '../../constants';

type Props = {};

export default props => {
  const [unMount, setUnMount] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    store.set('showGlobalOptionsJavaModal', false);
  }, []);

  const fixJavaProblem = async () => {
    setFixing(true);
    store.set('showGlobalOptionsJavaModal', true);
    if (platform() === WINDOWS) {
      try {
        // Deletes the _JAVA_OPTIONS from the system register
        const { stdout, stderr } = await promisify(exec)(
          `REG delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /F /V _JAVA_OPTIONS`,
          { name: 'GDLauncher Java Fixer' }
        );
      } catch (err) {
        if (
          typeof err === 'string' &&
          err.includes('User did not grant permission')
        ) {
          message.warn('You need to confirm UAC dialog to proceed');
          setFixing(false);
          log.error(err);
          return;
        }
        log.error(err.message);
      } finally {
        try {
          // Removes the _JAVA_OPTIONS and sets it to empty in the user registry to apply it without rebooting
          const { stdout, stderr } = await promisify(childProcess.exec)(
            'SETX _JAVA_OPTIONS "" & REG delete HKCU\\Environment /F /V _JAVA_OPTIONS'
          );
        } catch {}
      }
    } else {
      try {
        // unset _JAVA_OPTIONS should be enough
        const { stdout, stderr } = await promisify(childProcess.exec)(
          'unset _JAVA_OPTIONS'
        );
      } catch {}
    }
    setFixing(false);
    setFinished(true);
  };

  const quitApp = async () => {
    remote.app.quit();
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="Java Problem Detected: _JAVA_OPTIONS"
      style={{ height: 400, width: 650 }}
    >
      {finished === true ? (
        <div className={styles.finished}>
          <div>
            <h1>All Done! We Fixed The Issue!</h1>
            <div>
              For changes to apply you need to manually reopen the launcher
              <br /> Happy Gaming!
            </div>
            <Button
              className={styles.restartBtn}
              type="primary"
              onClick={quitApp}
            >
              Exit Launcher
            </Button>
          </div>
        </div>
      ) : (
        <React.Fragment>
          <div className={styles.main}>
            Hey, we are sorry to tell you that we found a problem in your java
            installation. The good news is that we can fix it 😄 <br /> <br />
            We highly recommend fixing it since it can cause multiple errors
            with the game. <br /> <br />
            Do you want us to unset the _JAVA_OPTIONS global variable from your
            system?
            <br /> We may ask for Administrator Privileges
            <br /> <br />
            <br />
            <div>
              <b>If you are unsure</b> about what _JAVA_OPTIONS is, just click "
              <b>Fix It</b>".
            </div>
          </div>
          <div className={styles.buttons}>
            <span onClick={() => (fixing ? null : setUnMount(true))}>
              No, I Like It This Way
            </span>
            <Button type="primary" loading={fixing} onClick={fixJavaProblem}>
              Yes, Fix It
            </Button>
          </div>
        </React.Fragment>
      )}
    </Modal>
  );
};
