import React from 'react';
import ContentLoader from 'react-content-loader';
import ReactHtmlParser from 'react-html-parser';
import ProgressiveImage from 'react-progressive-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { numberToRoundedWord } from 'App/utils';
import Modal from '../Common/Modal/Modal';
import { useGetAddon, useGetAddonDescription } from '../../hooks/cursemeta';
import styles from './CurseModpackExplorerModal.scss';

const Loader = () => (
  <ContentLoader
    height="100%"
    width="100%"
    speed={0.6}
    ariaLabel={false}
    primaryColor="var(--secondary-color-2)"
    secondaryColor="var(--secondary-color-3)"
    style={{
      height: '100%',
      width: '100%'
    }}
  >
    <rect x="25%" y="50" rx="0" ry="0" width="55%" height="50" />
    {[...Array(Math.round(window.innerHeight / 95))].map((v, i) => (
      <rect x="15%" y={i * 50 + 120} rx="0" ry="0" width="75%" height="30" />
    ))}
  </ContentLoader>
);

export default props => {
  const { id: addonID } = props;
  const response = useGetAddon(addonID);
  const description = useGetAddonDescription(addonID);

  return (
    <Modal
      header="false"
      title="Modpack Explorer"
      transparentBackground
      backBtn={
        <div className={styles.closeBtn}>
          <FontAwesomeIcon icon={faWindowClose} />
        </div>
      }
      style={{ height: '100%', width: '100%' }}
    >
      <>
        <ProgressiveImage
          src={props.images.url}
          placeholder={props.images.thumbnailUrl}
        >
          {(src, loading) => (
            <img
              alt="background"
              style={{
                zIndex: -1,
                position: 'absolute',
                left: 0,
                top: 0,
                objectFit: 'cover',
                height: '100%',
                width: '100%'
              }}
              src={src}
            />
          )}
        </ProgressiveImage>
        <div className={styles.container}>
          <div
            className={styles.content}
            style={{ opacity: response && description ? 1 : 0 }}
          >
            <h1
              style={{
                fontSize: 60,
                fontWeight: 900,
                marginTop: 20
              }}
            >
              {response && response.name}
            </h1>
            <span
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-around'
              }}
            >
              <span>
                {response && numberToRoundedWord(response.downloadCount)}{' '}
                downloads
              </span>
              <span>
                by{' '}
                {response &&
                  response.authors.map(author => author.name).join(', ')}
              </span>
              <span>
                Updated:{' '}
                {response &&
                  new Date(response.latestFiles[0].fileDate).toLocaleDateString(
                    'en-US',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }
                  )}
              </span>
            </span>
            <div className={styles.description}>
              {description && ReactHtmlParser(description)}
            </div>
          </div>
        </div>
      </>
    </Modal>
  );
};
