/* eslint-disable react/no-unescaped-entities */
import React, { memo } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import ModalWindow from 'src/renderer/common/components/ModalWindow';
import CloseButton from 'src/renderer/common/components/CloseButton';
// import EV from 'src/common/messageEvents';
// import sendMessage from '../../helpers/sendMessage';

const Changelogs = () => {
  //   const [version, setVersion] = useState(null);

  //   useEffect(() => {
  //     sendMessage(EV.GET_APP_VERSION).then(setVersion).catch(console.error);
  //   }, []);

  return (
    <ModalWindow
      css={`
        height: 100%;
        width: 100%;
      `}
      removePadding
      transparentBackground
      header={false}
      backBtnFn={goBack => (
        <div
          css={`
            position: absolute;
            right: 50px;
            top: 50px;
            z-index: 1;
          `}
        >
          <CloseButton onClick={goBack} />
        </div>
      )}
    >
      <Container>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            <span>New Features</span>
          </SectionTitle>
          <div>
            <ul>
              <li>Restyled the UI to add new instances.</li>
              <li>Some performance improvements.</li>
              <li>Better UX for twitch modpacks.</li>
              <li>Longer instances names are now allowed.</li>
              <li>Added a resource packs tab for instances.</li>
            </ul>
          </div>
        </Section>
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
              <li>Security fixes.</li>
              <li>Improved login errors.</li>
              <li>The news should now be up to date.</li>
              <li>Minor visual/functional fixes.</li>
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
              width: 200px;
              height: 40px;
              font-size: 20px;
              padding: 4px !important;
              margin-top: 20px;
            `}
            type="primary"
            href="https://discord.gg/4cGYzen"
          >
            <FontAwesomeIcon icon={faDiscord} />
            &nbsp; Discord
          </Button>
        </Section>
      </Container>
    </ModalWindow>
  );
};

export default memo(Changelogs);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
  padding: 40px 20%;
  position: relative;
`;

const SectionTitle = styled.h2`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid;
  line-height: 0.1em;
  margin: 10px 0 20px;

  span {
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
