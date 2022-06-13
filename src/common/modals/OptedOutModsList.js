import React, { useEffect, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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
  align-items: center;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;

const ModsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  max-height: 250px;
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

const ModRow = ({ mod, loadedMods, currentMod, missingMods }) => {
  const { modManifest, addon } = mod;
  const loaded = loadedMods.includes(modManifest.id);
  const missing = missingMods.includes(modManifest.id);
  const ref = useRef();

  const isCurrentMod = currentMod?.modManifest?.id === modManifest.id;

  useEffect(() => {
    if (!loaded && isCurrentMod) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [isCurrentMod, loaded]);

  return (
    <RowContainer ref={ref}>
      <div>{`${addon?.name} - ${modManifest?.displayName}`}</div>
      {loaded && !missing && <div className="dot" />}
      {loaded && missing && (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          css={`
            color: ${props => props.theme.palette.colors.yellow};
          `}
        />
      )}
      {!loaded && isCurrentMod && (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      )}
    </RowContainer>
  );
};

const OptedOutModsList = ({
  optedOutMods,
  instancePath,
  resolve,
  reject,
  preventClose
}) => {
  const [loadedMods, setLoadedMods] = useState([]);
  const [missingMods, setMissingMods] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);

  const optedOutModalIndex = modals.findIndex(
    x => x.modalType === 'OptedOutModsList'
  );

  const currentMod = downloading ? optedOutMods[loadedMods.length] : null;

  useEffect(() => {
    const listener = () => {
      dispatch(closeModal());
      setTimeout(() => {
        reject('Download window closed unexpectedly');
      }, 300);
    };

    ipcRenderer.once('opted-out-window-closed-unexpected', listener);

    return () => {
      ipcRenderer.removeListener(
        'opted-out-window-closed-unexpected',
        listener
      );
    };
  }, []);

  useEffect(() => {
    const listener = (e, status) => {
      if (!status.error) {
        if (optedOutMods.length === loadedMods.length + 1) {
          if (missingMods.length === 0) {
            resolve();
            dispatch(closeModal());
          }
          setDownloading(false);
        }
        setLoadedMods(prev => [...prev, status.modId]);
        if (status.warning) setMissingMods(prev => [...prev, status.modId]);
      } else {
        dispatch(closeModal());
        setTimeout(() => {
          reject(status.error);
        }, 300);
      }
    };

    ipcRenderer.once('opted-out-download-mod-status', listener);

    return () => {
      ipcRenderer.removeListener(
        'opted-out-window-closed-unexpected',
        listener
      );
    };
  }, [loadedMods, missingMods]);

  return (
    <Modal
      css={`
        height: 400px;
        width: 800px;
        overflow-x: hidden;
      `}
      preventClose={preventClose}
      closeCallback={() => {
        setTimeout(
          () => reject(new Error('Download Aborted by the user')),
          300
        );
      }}
      title="Opted out mods list"
    >
      <Container>
        <div
          css={`
            text-align: left;
            margin-bottom: 2rem;
          `}
        >
          Hey oh! It looks like some developers opted out from showing their
          mods on third-party launchers. We can still attempt to download them
          automatically. Please click continue and wait for all downloads to
          finish. Please don&apos;t click anything inside the browser.
        </div>
        <ModsContainer>
          {optedOutMods &&
            optedOutMods.map(mod => (
              <ModRow
                mod={mod}
                loadedMods={loadedMods}
                currentMod={currentMod}
                missingMods={missingMods}
              />
            ))}
        </ModsContainer>
        <div
          css={`
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-top: 20px;
          `}
        >
          <Button
            danger
            type="text"
            disabled={downloading || loadedMods.length !== 0}
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
          {missingMods.length === 0 && (
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
                  instancePath
                });
              }}
              css={`
                background-color: ${props => props.theme.palette.colors.green};
              `}
            >
              Confirm
            </Button>
          )}
          {missingMods.length > 0 && (
            <Button
              type="primary"
              disabled={downloading}
              onClick={() => {
                resolve();
                dispatch(closeModal());
              }}
              css={`
                background-color: ${props => props.theme.palette.colors.green};
              `}
            >
              Continue
            </Button>
          )}
        </div>
      </Container>
    </Modal>
  );
};

export default OptedOutModsList;
