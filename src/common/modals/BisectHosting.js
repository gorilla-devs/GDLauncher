import React, { memo } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import BisectHostingLogo from '../../ui/BisectHosting';

const BisectHosting = () => {
  return (
    <Modal
      css={`
        height: 360px;
        width: 500px;
      `}
      title="We teamed up with BisectHosting"
    >
      <Container>
        <BisectHostingLogo size={70} />
        <h2
          css={`
            margin-top: 20px;
          `}
        >
          Get yourself a server from{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            $2.99
          </span>{' '}
          using our coupon{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            GDL
          </span>{' '}
          with{' '}
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            25%
          </span>{' '}
          off!
        </h2>
        <a href="https://bisecthosting.com/gdl">
          <Button
            type="primary"
            css={`
              margin-top: 50px;
            `}
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
