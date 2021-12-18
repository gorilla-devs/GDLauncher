/* eslint-disable react/no-unescaped-entities */
import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faStar, faWrench } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import { Select } from 'antd';
import Modal from '../../components/Modal';
import SocialButtons from '../../components/SocialButtons';
import KoFiButton from '../../assets/ko-fi.png';
import UpdateIllustration from '../../assets/update_illustration.png';
import { openModal } from '../../reducers/modals/actions';
import ga from '../../utils/analytics';
import changelog from './changeLog';

const UpdateRow = ({ header, content, advanced }) => {
  if (!header) return <></>;

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
        <>
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
        </>
      )}
    </li>
  );
};

const ChangeLogs = () => {
  const getVersionChangelog = (version, useBeta) => {
    const finalChangelog = { version, new: [], improvements: [], bugfixes: [] };
    changelog.forEach(i => {
      if (
        i.version === version || // include anyway if selected version
        (useBeta && // only include beta versions if wanted
          i.version.startsWith(version) && // Has to match same version
          i.version.indexOf('-beta') === version.length)
        // if beginning of version matches, make sure there is no sub-version until the beta begins
        // yes, this condition chaos is the best solution I could come up with.
      ) {
        if (i.new) finalChangelog.new.push(...i.new);
        if (i.improvements) finalChangelog.improvements.push(...i.improvements);
        if (i.bugfixes) finalChangelog.bugfixes.push(...i.bugfixes);
      }
    });
    if (version && version.indexOf('-beta') === -1) {
      const removeIfBeta = (elem, i, arr) => {
        if (elem.betaOnly) arr.splice(i, 1);
      };
      finalChangelog.new.forEach(removeIfBeta);
      finalChangelog.improvements.forEach(removeIfBeta);
      finalChangelog.bugfixes.forEach(removeIfBeta);
    }
    return finalChangelog;
  };

  const [version, setVersion] = useState(null);
  const [includeBeta, setIncludeBeta] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skipIObserver, setSkipIObserver] = useState(true);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentChangelog, setCurrentChangelog] = useState(
    getVersionChangelog('empty')
  );
  const dispatch = useDispatch();
  const { ref: intersectionObserverRef, inView: insectionObserverInView } =
    useInView({
      threshold: 0.3,
      initialInView: false,
      triggerOnce: true,
      skip: skipIObserver
    });

  useEffect(() => {
    setCurrentChangelog(getVersionChangelog(currentVersion, includeBeta));
  }, [currentVersion]);

  useEffect(() => {
    ipcRenderer
      .invoke('getAppVersion')
      .then(v => {
        setVersion(v);
        setCurrentVersion(`v${v}`);
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
        height: 600px;
        width: 500px;
      `}
      title={`What's new in ${version}`}
      removePadding
    >
      <Container>
        <Header>
          <img
            css={`
              border-radius: 5px;
              width: 100%;
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
          {currentChangelog.new.length ? (
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
            {currentChangelog.new.map((item, index) => (
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
          {currentChangelog.improvements.length ? (
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
            {currentChangelog.improvements.map((item, index) => (
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
          {currentChangelog.bugfixes.length ? (
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
            {currentChangelog.bugfixes.map((item, index) => (
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
        <div
          css={`
            background-color: #00000016;
            box-shadow: 5px 4px 3px #00000026;
            border-radius: 5px;
            height: 80px;
            padding: 0 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <div
            css={`
              width: 150px;
            `}
          >
            <span
              css={`
                margin-bottom: -10px;
                margin-left: 2px;
                color: ${props => props.theme.palette.text.secondary};
              `}
            >
              Selected Changelog
            </span>
            <Select
              css={`
                width: 100%;
              `}
              onChange={e => setCurrentVersion(e)}
              value={currentVersion}
            >
              {changelog.map(current => {
                return (
                  <Select.Option value={current.version} key={current.version}>
                    {current.version}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
          <div
            css={`
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: space-evenly;
              width: 185px;

              span {
                color: ${props => props.theme.palette.primary.light};
                text-align: right;
              }
            `}
          >
            <a onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced
                ? 'Hide extended information'
                : 'Show extended information'}
            </a>
            <a
              onClick={() => {
                setIncludeBeta(!includeBeta);
                setCurrentChangelog(
                  getVersionChangelog(currentVersion, !includeBeta)
                );
              }}
            >
              {includeBeta
                ? 'Exclude beta changelogs'
                : 'Include beta changelogs'}
            </a>
          </div>
        </div>
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
    padding: 0;
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
