/* eslint-disable react/no-unescaped-entities */
import React, { memo, useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import TypeAnimation from 'react-type-animation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faStar, faWrench } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import Modal from '../../components/Modal';
import SocialButtons from '../../components/SocialButtons';
import KoFiButton from '../../assets/ko-fi.png';
import UpdateIllustration from '../../assets/update_illustration.png';
import UpdateIllustrationChristmas from '../../assets/update_illustration_christmas.png';
import { openModal } from '../../reducers/modals/actions';
import ga from '../../utils/analytics';
import changelog from './changeLog';

const UpdateRow = ({ header, content, advanced }) => {
  const prSplit = advanced?.pr?.split('/');
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
      {advanced && (
        <div
          css={`
            color: ${props => props.theme.palette.text.third};
            font-size: 12px;
            a {
              color: ${props => props.theme.palette.primary.light};
            }
            a:hover {
              color: ${props => props.theme.palette.primary.main};
            }
          `}
        >
          <a
            href={`https://github.com/gorilla-devs/GDLauncher/commit/${advanced.cm}`}
          >
            {advanced.cm}
          </a>
          {prSplit && (
            <>
              {' | '}
              {/* Yes, this was the best (and shortest) version to do this I could come up with */}
              <a
                href={`https://github.com/gorilla-devs/GDLauncher/pull/${
                  prSplit[0]
                }${prSplit.length > 1 ? `/commits/${prSplit[1]}` : ''}`}
              >
                #{advanced.pr}
              </a>
            </>
          )}
          {advanced.ms && <> | {advanced.ms}</>}
        </div>
      )}
    </li>
  );
};

const ChangeLogs = () => {
  const [version, setVersion] = useState(null);
  const [skipIObserver, setSkipIObserver] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dispatch = useDispatch();
  const { ref: intersectionObserverRef, inView: insectionObserverInView } =
    useInView({
      threshold: 0.3,
      initialInView: false,
      triggerOnce: true,
      skip: skipIObserver
    });

  const typingSequence = useMemo(() => {
    const completText = 'Merry Christmas!';
    let textSoFar = '';
    const newArr = [];
    let timeToWait = 1300;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < completText.length; i++) {
      textSoFar += completText[i];
      newArr.push(textSoFar, 50);
      timeToWait += 50;
    }

    const completTextGDL = 'from the GDL Team';
    let textSoFarGDL = '';
    const fromGDLArr = [timeToWait];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < completTextGDL.length; i++) {
      textSoFarGDL += completTextGDL[i];
      fromGDLArr.push(textSoFarGDL, 50);
    }

    return {
      merryChristmas: newArr,
      fromGDL: fromGDLArr
    };
  }, []);

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

  const isChristmas =
    new Date().getMonth() === 11 &&
    [21, 22, 23, 24, 25, 26, 27, 28, 29].includes(new Date().getDate());

  return (
    <Modal
      css={`
        height: 550px;
        width: 475px;
      `}
      title={`What's new in ${version}`}
      removePadding
    >
      <Container>
        <Header>
          {isChristmas ? (
            <div
              css={`
                width: 430px;
              `}
            >
              <h1
                css={`
                  font-weight: bold;
                `}
              >
                <TypeAnimation
                  cursor={false}
                  sequence={typingSequence.merryChristmas}
                  wrapper="span"
                />{' '}
                <span
                  css={`
                    font-size: 16px;
                    font-weight: normal;
                  `}
                >
                  <TypeAnimation
                    cursor={false}
                    sequence={typingSequence.fromGDL}
                    wrapper="span"
                  />
                </span>
              </h1>
            </div>
          ) : (
            ''
          )}
          <img
            css={`
              border-radius: 5px;
              width: 401px;
            `}
            src={isChristmas ? UpdateIllustrationChristmas : UpdateIllustration}
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
          <a
            css={`
              margin-top: 20px;
              color: ${props => props.theme.palette.primary.light};
            `}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced
              ? 'Hide extended information'
              : 'Show extended information'}
          </a>
        </Header>
        <Section>
          {changelog.new.length ? (
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
          ) : null}
          <ul>
            {changelog.new.map((item, index) => (
              <UpdateRow
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                header={item.header}
                content={item.content}
                advanced={showAdvanced && item.advanced}
              />
            ))}
          </ul>
        </Section>
        <Section>
          {changelog.improvements.length ? (
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
          ) : null}
          <ul>
            {changelog.improvements.map((item, index) => (
              <UpdateRow
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                header={item.header}
                content={item.content}
                advanced={showAdvanced && item.advanced}
              />
            ))}
          </ul>
        </Section>
        <Section>
          {changelog.bugfixes.length ? (
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
          ) : null}
          <ul ref={intersectionObserverRef}>
            {changelog.bugfixes.map((item, index) => (
              <UpdateRow
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                header={item.header}
                content={item.content}
                advanced={showAdvanced && item.advanced}
              />
            ))}
          </ul>
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
  ul {
    padding: 0px;
    list-style-position: inside;
    width: 100%;
    margin: 20px 0;
    border-radius: 5px;
  }

  li {
    text-align: start;
    list-style-type: none;
    margin: 10px 0;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
`;
