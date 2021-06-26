/* eslint-disable react/no-unescaped-entities */
import React, { memo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import Modal from '../components/Modal';

const ChangeLogs = () => {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
  }, []);

  return (
    <Modal
      css={`
        height: 500px;
        width: 650px;
      `}
      title={`What's new in ${version}`}
    >
      <Container>
        {/* <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            <span>New Features</span>
          </SectionTitle>
          <div>
            <ul>
              <li>
                Automatically set recommended/minimum RAM amount for FTB
                modpacks, and eventually show a confirmation modal in case the
                user has not enough.
              </li>
              <li>Added modlist.html when exporting instances.</li>
            </ul>
          </div>
        </Section> */}
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            <span>Bug Fixes</span>
          </SectionTitle>
          <div>
            <ul>
              <li>Various QoL fixes.</li>
            </ul>
          </div>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.lavander};
            `}
          >
            <span>Join Our Community</span>
          </SectionTitle>
          <p>
            We love our users, that's why we have a dedicated Discord server
            just to talk with all of them!
          </p>
          <Button
            css={`
              font-size: 20px;
              margin-top: 20px;
            `}
            type="primary"
            size="large"
            href="https://discord.gg/4cGYzen"
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

export const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
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
  font-size: 16px;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    margin: 40px 0;
    border-radius: 5px;

    p {
      margin: 20px 0;
    }

    li {
      text-align: start;
    }
  }
`;
