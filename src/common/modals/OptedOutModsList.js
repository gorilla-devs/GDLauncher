import React, { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spin } from 'antd';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import Modal from '../components/Modal';
import { UPDATE_MODAL } from '../reducers/modals/actionTypes';
import { closeModal } from '../reducers/modals/actions';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-conter: space-between;
  gap: 10px;
  overflow-y: auto;
  align-items: center;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  height: 20px;
  padding: 20px 10px;
  background: ${props => props.theme.palette.grey[800]};

  &:hover {
    .rowCenterContent {
      color: ${props => props.theme.palette.text.primary};
    }
  }

  .dot {
    border-radius: 50%;
    height: 10px;
    width: 10px;
    background: ${props => props.theme.palette.colors.green};
  }
`;

const ModRow = ({ mod, loadedMods, currentMod }) => {
  const { modManifest } = mod;
  const loaded = loadedMods.includes(modManifest.id);

  const isCurrentMod = currentMod?.modManifest?.id === modManifest.id;

  return (
    <RowContainer>
      <div>{modManifest?.displayName}</div>
      {loaded && <div className="dot" />}
      {!loaded && isCurrentMod && (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      )}
    </RowContainer>
  );
};

const OptedOutModsList = ({
  optedOutMods,
  modDestFile,
  resolve,
  reject,
  preventClose
}) => {
  const [loadedMods, setLoadedMods] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);

  const optedOutModalIndex = modals.findIndex(
    x => x.modalType === 'OptedOutModsList'
  );

  const currentMod = downloading ? optedOutMods[loadedMods.length] : null;

  useEffect(() => {
    ipcRenderer.once('opted-out-download-mod-status', (e, status) => {
      if (!status.error) {
        if (optedOutMods.length === loadedMods.length + 1) {
          dispatch(closeModal());
          resolve();
        }
        setLoadedMods(prev => [...prev, status.modId]);
      } else {
        dispatch(closeModal());
        reject(status.error);
      }
    });
  }, [loadedMods]);

  return (
    <Modal
      css={`
        height: 400px;
        width: 800px;
        overflow-x: hidden;
      `}
      preventClose={preventClose}
      closeCallback={() =>
        setTimeout(() => reject(new Error('Download Aborted by the user')), 300)
      }
      title="Opted out mods list"
    >
      <Container>
        {optedOutMods &&
          optedOutMods.map(mod => (
            <ModRow mod={mod} loadedMods={loadedMods} currentMod={currentMod} />
          ))}
        <div
          css={`
            display: flex;
            width: 100%;
            justify-content: flex-end;
            align-items: center;
            gap: 20px;
            margin-top: 20px;
          `}
        >
          <Button
            type="primary"
            danger
            disabled={downloading}
            onClick={() => {
              dispatch(closeModal());
              setTimeout(
                () => reject(new Error('Download Aborted by the user')),
                300
              );
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={downloading}
            onClick={() => {
              setDownloading(true);

              dispatch({
                type: UPDATE_MODAL,
                modals: [
                  ...modals.slice(0, optedOutModalIndex),
                  {
                    modalType: 'OptedOutModsList',
                    modalProps: {
                      ...modals[optedOutModalIndex].modalProps,
                      preventClose: true
                    }
                  },
                  ...modals.slice(optedOutModalIndex + 1)
                ]
              });
              ipcRenderer.invoke('download-optedout-mods', {
                mods: optedOutMods,
                modDestFile
              });
            }}
            css={`
              background-color: ${props => props.theme.palette.colors.green};
            `}
          >
            Confirm
          </Button>
        </div>
      </Container>
    </Modal>
  );
};

export default OptedOutModsList;
