import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from '../components/Modal';
import { closeModal, openModal } from '../reducers/modals/actions';
import BisectHosting from '../../ui/BisectHosting';
import ga from '../utils/analytics';

let timer;

const InstanceStartupAd = ({ instanceName }) => {
  const dispatch = useDispatch();

  const openBisectHostingModal = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    dispatch(closeModal());
    setTimeout(() => {
      ga.sendCustomEvent('BHAdViewNavbar');
      dispatch(openModal('BisectHosting'));
    }, 225);
  };

  return (
    <Modal
      css={`
        height: 330px;
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
          text-align: center;
        `}
      >
        <span
          css={`
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            margin-top: 20px;
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
            <div>Thank you!</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
