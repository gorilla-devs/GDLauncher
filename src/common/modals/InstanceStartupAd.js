import React, { memo, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../components/Modal';
import { closeModal, openModal } from '../reducers/modals/actions';
import BisectHosting from '../../ui/BisectHosting';

let timer;

const InstanceStartupAd = ({ instanceName }) => {
  const dispatch = useDispatch();
  const startedInstances = useSelector(state => state.startedInstances);
  const isPlaying = startedInstances[instanceName];
  const initTime = useMemo(() => Date.now(), []);

  const openBisectHostingModal = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    dispatch(closeModal());
    setTimeout(() => {
      dispatch(openModal('BisectHosting'));
    }, 225);
  };

  useEffect(() => {
    if (!timer && (isPlaying?.initialized || !isPlaying)) {
      if (Date.now() - initTime < 5000) {
        timer = setTimeout(() => {
          if (timer) {
            dispatch(closeModal());
            clearTimeout(timer);
            timer = null;
          }
        }, Date.now() - initTime);
      } else {
        dispatch(closeModal());
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }, [isPlaying?.initialized]);

  return (
    <Modal
      css={`
        height: 60%;
        width: 60%;
        max-width: 650px;
        max-height: 460px;
        overflow-x: hidden;
      `}
      title={`Starting up ${instanceName}`}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        `}
      >
        <span
          css={`
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 30px;
          `}
        >
          Your instance is starting...
        </span>
        <div
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <span
            css={`
              margin-right: 30px;
              font-size: 18px;
            `}
          >
            Grab a server from <br /> our official partner
          </span>
          <div
            css={`
              cursor: pointer;
            `}
          >
            <BisectHosting
              onClick={openBisectHostingModal}
              size={100}
              showPointerCursor
            />
          </div>
        </div>
        <span
          css={`
            font-size: 70px;
            color: ${({ theme }) => theme.palette.colors.red};
            margin-top: 10px;
          `}
        >
          &#10084;
        </span>
        <div>Thank you!</div>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
