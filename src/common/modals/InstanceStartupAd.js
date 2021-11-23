import React, { memo, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
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
        height: 300px;
        width: 650px;
        overflow-x: hidden;
      `}
      title={`Starting up ${instanceName}`}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          flex-direction: column;
          height: 100%;
          text-align: center;
        `}
      >
        <span
          css={`
            font-size: 24px;
            font-weight: bold;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          `}
        >
          Your instance is starting...
          <LoadingOutlined
            css={`
              margin-left: 30px;
              font-size: 50px;
            `}
          />
        </span>
        <div
          css={`
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;

            & > * {
              margin: 0 20px;
            }
          `}
        >
          <span
            css={`
              font-size: 14px;
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
              size={60}
              showPointerCursor
            />
          </div>
          <div>
            <span
              css={`
                font-size: 70px;
                color: ${({ theme }) => theme.palette.colors.red};
              `}
            >
              &#10084;
            </span>
            <p
              css={`
                margin-top: -25px;
                margin-bottom: 25px;
              `}
            >
              Thank you!
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
