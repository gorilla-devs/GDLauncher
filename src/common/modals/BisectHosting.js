import React, { memo } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import BisectHostingLogo from '../../ui/BisectHosting';
import ga from '../utils/analytics';

const BisectHosting = () => {
  return (
    <Modal
      css={`
        height: 360px;
        width: 500px;
        font-size: 10px;
        line-height: 1.8;
      `}
      title="We teamed up with BisectHosting"
    >
      <Container>
        <BisectHostingLogo size={70} hover />
        <h2
          css={`
            margin-top: 20px;
          `}
        >
          Grab a server from our official partner{' '}
          <span
            css={`
              font-weight: 800;
            `}
          >
            BisectHosting
          </span>{' '}
          <span>for effortless modded server installs and updates.</span> New
          customers can save{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            25%
          </span>{' '}
          off their first month using the promo code{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            GDL
          </span>{' '}
          at checkout.
        </h2>
        <a href="https://bisecthosting.com/gdl">
          <Button
            type="primary"
            css={`
              margin-top: 25px;
            `}
            onClick={() => {
              ga.sendCustomEvent('BHClickAdLink');
            }}
          >
            Go to BisectHosting.com &nbsp;
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Button>
        </a>
      </Container>
    </Modal>
  );
};

export default memo(BisectHosting);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;
