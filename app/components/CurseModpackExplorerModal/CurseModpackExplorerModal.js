import React, { useState, useEffect, useRef } from 'react';
import ContentLoader from 'react-content-loader';
import axios from 'axios';
import { Button } from 'antd';
import log from 'electron-log';
import ReactHtmlParser from 'react-html-parser';
import ProgressiveImage from 'react-progressive-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Common/Modal/Modal';
import { numberToRoundedWord } from '../../utils/numbers';
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
  const { addonID } = props.match.params;
  const [unMount, setUnMount] = useState(false);
  const response = useGetAddon(addonID);
  const description = useGetAddonDescription(addonID);

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      header="false"
      title="Modpack Explorer"
      backBtn={
        <div className={styles.closeBtn}>
          <FontAwesomeIcon icon={faWindowClose} />
        </div>
      }
      style={{ height: '80vh', width: '80vw', maxWidth: 1000 }}
    >
      {response && description ? (
        <div className={styles.container}>
          <div
            style={{
              height: '100%'
            }}
            className={styles.overlay}
          >
            <ProgressiveImage
              src={response.attachments[0].url}
              placeholder={response.attachments[0].thumbnailUrl}
            >
              {(src, loading) => (
                <img
                  style={{
                    zIndex: -1,
                    position: 'fixed',
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
          </div>
          <h1
            style={{
              position: 'relative',
              top: -150,
              fontSize: 40,
              width: '100%',
              textAlign: 'center'
            }}
          >
            {response.name}
          </h1>
          <span
            style={{
              position: 'relative',
              marginTop: -140,
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            <span>{numberToRoundedWord(response.downloadCount)} downloads</span>
            <span>
              by {response.authors.map(author => author.name).join(', ')}
            </span>
            <span>
              Updated:{' '}
              {new Date(response.latestFiles[0].fileDate).toLocaleDateString(
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
            {ReactHtmlParser(description)}
          </div>
        </div>
      ) : (
          <Loader />
        )}
    </Modal>
  );
};
