/* eslint-disable react/no-unescaped-entities */
import React, { memo } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import Modal from '../components/Modal';

const ChangeLogs = ({ version }) => {
  return (
    <Modal
      css={`
        height: 500px;
        width: 650px;
      `}
      title={`What's new in ${version}`}
    >
      <Container>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            <span>New Features!</span>
          </SectionTitle>
          <div>
            <ul>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
            </ul>
          </div>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            <span>Bug Fix</span>
          </SectionTitle>
          <div>
            <ul>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
              <li>ppsd</li>
            </ul>
          </div>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.lavander};
            `}
          >
            <span>Thanks for using GDLauncher</span>
          </SectionTitle>
          <p>
            We love our users, that's why we have a dedicated discorc server
            just to talk to all of them!
          </p>
          <Button
            css={`
              width: 200px;
              height: 40px;
              background: #7289da;
              padding: 0;
            `}
            href="https://discord.gg/WumUmE6"
          >
            <FontAwesomeIcon icon={faDiscord} />
            &nbsp; Discord
          </Button>
        </Section>
      </Container>
    </Modal>
  );
};

export default memo(ChangeLogs);

const Container = styled.div`
  width: 100%;
  height: 410px;
  text-align: center;
  padding: 0 30px;
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
`;

const SectionTitle = styled.h2`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid;
  line-height: 0.1em;
  margin: 10px 0 20px;

  span {
    background: ${props => props.theme.palette.secondary.main};
    padding: 0 10px;
  }
`;

const Section = styled.div`
  width: 100%;
  text-align: center;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 200px;
    margin: 40px 0;
    border-radius: 5px;
    background: ${props => props.theme.palette.grey[900]};

    p {
      margin: 20px 0;
    }

    li {
      text-align: start;
    }
  }
`;
