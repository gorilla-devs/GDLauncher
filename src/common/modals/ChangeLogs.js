/* eslint-disable react/no-unescaped-entities */
import React, { memo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faStar, faWrench } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import Modal from '../components/Modal';
import SocialButtons from '../components/SocialButtons';
import KoFiButton from '../assets/ko-fi.png';
import UpdateIllustration from '../assets/update_illustration.png';
import { openModal } from '../reducers/modals/actions';
import ga from '../utils/analytics';

const UpdateRow = ({ header, content }) => {
  return (
    <li>
      &bull; {header}{' '}
      <span
        css={`
          color: ${props => props.theme.palette.text.third};
        `}
      >
        {content}
      </span>
    </li>
  );
};

const data = {
  new: [
    {
      header: 'You can now sort your instances!',
      content: 'We added a way to let you sort your instances.'
    },
    {
      header: 'Added a button to check for mod updates.',
      content:
        'Now you can click on a button to check for new updates whenever you want.'
    },
    {
      header: 'Patreon to Ko-fi.',
      content:
        'We have decided to move from patreon to ko-fi, now you can also donate once without subscribing.'
    },
    {
      header: 'Added the option to start Minecraft without simlink.',
      content: 'This only applies to windows.'
    }
  ],
  improvements: [
    {
      header: 'Reduce the amout of requests when installing modpacks.',
      content: 'You can now download everything faster 🎉.'
    },
    {
      header: 'Improved how we zip all your stuff.',
      content: 'We just simplified the zipping system we use with 7z.'
    },
    {
      header: 'Updated our dependencies.',
      content:
        'We updated some of our dependecies such as electron and some native libs.'
    }
  ],
  bugfixes: [
    {
      header: 'Fixed crash on startup in beta.',
      content: 'Your launcher is not gonna explode anymore (we hope).'
    },
    {
      header: 'Fixed stretched screenshot images.',
      content:
        'Your screenshots are not going to be stretched or shrinked anymore.'
    }
  ]
};

const ChangeLogs = () => {
  const [version, setVersion] = useState(null);
  const [skipIObserver, setSkipIObserver] = useState(true);
  const dispatch = useDispatch();
  const { ref: intersectionObserverRef, inView: insectionObserverInView } =
    useInView({
      threshold: 0.3,
      initialInView: false,
      triggerOnce: true,
      skip: skipIObserver
    });

  useEffect(() => {
    ipcRenderer
      .invoke('getAppVersion')
      .then(v => {
        setVersion(v);
        if (!v.includes('beta')) {
          setTimeout(() => {
            setSkipIObserver(false);
          }, 300);
        }
        return v;
      })
      .catch(console.error);
    ga.sendCustomEvent('changelogModalOpen');
  }, []);

  useEffect(() => {
    if (insectionObserverInView) {
      ga.sendCustomEvent('changelogModalReadAll');
    }
  }, [insectionObserverInView]);

  const openBisectModal = () => {
    dispatch(openModal('BisectHosting'));
    ga.sendCustomEvent('changelogModalOpenBisect');
  };

  return (
    <Modal
      css={`
        height: 550px;
        width: 450px;
      `}
      title={`What's new in ${version}`}
      removePadding
    >
      <Container>
        <Header>
          <img
            css={`
              border-radius: 5px;
            `}
            src={UpdateIllustration}
            alt="New Version"
          />
          <div
            css={`
              margin-top: 20px;
              color: ${props => props.theme.palette.text.third};
              span {
                color: ${props => props.theme.palette.text.primary};
                cursor: pointer;
                text-decoration: underline;
              }
            `}
          >
            If you appreciate our work, please consider supporting us through a
            donation or grab a server from our official partner{' '}
            <span onClick={openBisectModal}>BisectHosting</span>
          </div>
          <div
            css={`
              display: flex;
              align-items: center;
              justify-content: start;
              margin-bottom: 20px;
              margin-top: 20px;
              a:nth-child(1) {
                margin-right: 20px;
              }
              img {
                border-radius: 30px;
                height: 40px;
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
                &:hover {
                  transform: scale(1.05);
                }
              }
            `}
          >
            <a href="https://ko-fi.com/gdlauncher">
              <img src={KoFiButton} alt="Ko-Fi" />
            </a>
          </div>
        </Header>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            <span
              css={`
                display: flex;
                align-items: center;
              `}
            >
              <FontAwesomeIcon
                icon={faStar}
                css={`
                  margin-right: 10px;
                  font-size: 20px;
                `}
              />
              New
            </span>
          </SectionTitle>
          <div>
            <ul>
              {data.new.map(item => (
                <UpdateRow
                  key={item.header}
                  header={item.header}
                  content={item.content}
                />
              ))}
            </ul>
          </div>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.yellow};
            `}
          >
            <span
              css={`
                display: flex;
                align-items: center;
              `}
            >
              <FontAwesomeIcon
                icon={faWrench}
                css={`
                  margin-right: 10px;
                  font-size: 20px;
                `}
              />
              Improved
            </span>
          </SectionTitle>
          <div>
            <ul>
              {data.improvements.map(item => (
                <UpdateRow
                  key={item.header}
                  header={item.header}
                  content={item.content}
                />
              ))}
            </ul>
          </div>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            <span
              css={`
                display: flex;
                align-items: center;
              `}
            >
              <FontAwesomeIcon
                icon={faBug}
                css={`
                  margin-right: 10px;
                  font-size: 20px;
                `}
              />
              Bug Fixes
            </span>
          </SectionTitle>
          <div>
            <ul ref={intersectionObserverRef}>
              {data.bugfixes.map(item => (
                <UpdateRow
                  key={item.header}
                  header={item.header}
                  content={item.content}
                />
              ))}
            </ul>
          </div>
        </Section>
      </Container>
      <div
        css={`
          position: sticky;
          bottom: 0;
          height: 60px;
          width: 100%;
          background: ${props => props.theme.palette.grey[800]};
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 20px;
        `}
      >
        <SocialButtons />
        <span
          css={`
            padding-left: 20px;
            color: ${props => props.theme.palette.text.secondary};
          `}
        >
          Follow us for more updates
        </span>
      </div>
    </Modal>
  );
};

export default memo(ChangeLogs);

const Container = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
  padding: 20px;
`;

const SectionTitle = styled.h2`
  width: 100%;
  margin: 0;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 22px;
`;

const Section = styled.div`
  width: 100%;
  font-size: 16px;
  p {
    margin: 20px 0 !important;
  }
  div {
    width: 100%;
    margin: 20px 0;
    border-radius: 5px;

    ul {
      padding: 0px;
      list-style-position: inside;
    }

    li {
      text-align: start;
      list-style-type: none;
      margin: 10px 0;
    }
  }
`;

const Header = styled.div`
  height: 150px;
  margin-bottom: 200px;
`;
