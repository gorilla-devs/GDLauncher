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

const data = {
  new: [
    {
      header: 'We now automatically take care of java16.',
      content:
        'You can now run Minecraft >1.17 without issues!. You can also individually select a manual path for both versions from the settings.'
    },
    {
      header: 'You can now easily duplicate instances.',
      content: 'Just right-click on an instance and duplicate it.'
    },
    {
      header: 'Added support for forge 1.17!',
      content: "Let's hope they don't change their stuff again anytime soon 😬."
    },
    {
      header: 'Added privacy policy, ToS and acceptable use policy!',
      content:
        "You can go read them from the settings page if you're into legal stuff."
    }
  ],
  improvements: [
    {
      header: 'You can now select more java memory',
      content: 'in the memory slider up to the amount available on your device.'
    },
    {
      header: 'Improved the design of the changelog modal',
      content: 'as you can clearly see from here 😃.'
    },
    {
      header: 'Added social links to the settings sidebar',
      content: ''
    },
    {
      header: 'Drastically improved performance',
      content:
        'for modal pages such as instances creator, instances manager and settings.'
    },
    {
      header: 'Updated dependencies',
      content: 'for security and performance improvements.'
    },
    {
      header: 'Added usual MacOS default menu'
    },
    {
      header: 'Improved Discord RPC.',
      content:
        "It now shows the modpack / MC version you're playing. The modpack name will only be shown for new instances."
    },
    {
      header: 'Modal animation is now smoother and simpler.',
      content: 'This should make it feel "faster".'
    }
  ],
  bugfixes: [
    {
      header: 'Fixed accounts being hidden',
      content: 'when too many were added.'
    },
    {
      header: 'Fixed concurrent download preference',
      content: 'not being used when downloading FTB modpacks.'
    },
    {
      header: 'Fixed fabric mods not loading',
      content: 'due to curseforge changing their backend structure.'
    },
    {
      header:
        "Fixed a bug where we didn't correctly detect the curseforge modloader.",
      content: ''
    },
    {
      header: 'Fixed imports from external sources.',
      content: 'Both local zips and remote urls should now work correctly.'
    },
    {
      header: 'Fixed crash',
      content: 'when renaming instances.'
    },
    {
      header: 'Fixed news',
      content: 'not being correctly parsed sometimes.'
    },
    {
      header: 'Fixed export',
      content: 'not exporting correctly lol.'
    },
    {
      header: 'Fixed crash',
      content: 'when browsing mods.'
    }
  ]
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
        width: 475px;
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
              {data.new.map((item, index) => (
                <UpdateRow
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  header={item.header}
                  content={item.content}
                  advanced={showAdvanced && item.advanced}
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
              {data.improvements.map((item, index) => (
                <UpdateRow
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  header={item.header}
                  content={item.content}
                  advanced={showAdvanced && item.advanced}
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
              {data.bugfixes.map((item, index) => (
                <UpdateRow
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  header={item.header}
                  content={item.content}
                  advanced={showAdvanced && item.advanced}
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
  margin-bottom: 20px;
`;
