import { Button } from 'antd';
import { remote } from 'electron';
import path from 'path';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Modal from '../Common/Modal/Modal';
import FirstStep from './FirstStep';
import SecondStep from './SecondStep';
import BackButton from './BackButton';
import ContinueButton from './ContinueButton';
import styles from './ExportPackModal.scss';
import ThirdStep from './ThirdStep';
type Props = {};

const ExportPack = props => {
  const [unMount, setUnMount] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [actualStep, setActualStep] = useState(0);
  // const [packType, setPackType] = useState('Twitch');

  // const handleSubmit = e => {
  //   e.preventDefault();
  //   form.validateFields(async (err, values) => {
  //     if (!err) {
  //       if (filePath === null) {
  //         message.warning('Please select a zip file.');
  //       }

  //       try {
  //         await promisify(fs.access)(path.join(PACKS_PATH, values.packName));
  //         message.warning('An instance with this name already exists.');
  //       } catch (error) {
  //         setLoading(true);
  //         await props.importTwitchProfile(values.packName, filePath);
  //         setUnMount(true);
  //       }
  //     }
  //   });
  // };

  const showFileDialog = () => {
    remote.dialog.showOpenDialog(
      {
        properties: ['openDirectory']
      },
      paths => {
        setFilePath(paths[0]);
      }
    );
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="Export Pack"
      style={{ height: 400, width: 540 }}
    >
      {actualStep === 0 && (
        <FirstStep
          filePath={filePath}
          showFileDialog={showFileDialog}
          setActualStep={setActualStep}
        />
      )}
      {actualStep === 1 && (
        <SecondStep
          filePath={filePath}
          setActualStep={setActualStep}
          instanceName={props.match.params.instanceName}
          setSelectedFiles={setSelectedFiles}
          selectedFiles={selectedFiles}
        />
      )}
      {actualStep === 2 && (
        <ThirdStep
          filePath={filePath}
          setActualStep={setActualStep}
          instanceName={props.match.params.instanceName}
          selectedFiles={selectedFiles}
          setUnMount={setUnMount}
        />
      )}
    </Modal>
  );
};

const mapDispatchToProps = {};

export default connect(
  null,
  mapDispatchToProps
)(ExportPack);
