import React, { useState, useEffect, useRef } from 'react';
import ContentLoader from 'react-content-loader';
import axios from 'axios';
import { Button } from 'antd';
import ProgressiveImage from 'react-progressive-image';
import Modal from '../Common/Modal/Modal';
import { numberToRoundedWord } from '../../utils/numbers';
import { CURSEMETA_API_URL } from '../../constants';
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
  const [packData, setPackData] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(async () => {
    const { data } = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/${addonID}`
    );
    setPackData(data);
  }, []);

  const onScrollHandler = e => {
    if (e.target.scrollTop >= 335) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      header="false"
      title="Modpack Explorer"
      backBtn={
        <Button
          icon="close"
          size="large"
          type="ghost"
          style={{ position: 'absolute', right: '2%', top: '2%', zIndex: 100 }}
        />
      }
      style={{ height: '80vh', width: '80vw', maxWidth: 1000 }}
    >
      {packData !== null ? (
        <div className={styles.container} onScroll={onScrollHandler}>
          <div
            style={{
              height: '100%'
            }}
            className={styles.overlay}
          >
            <ProgressiveImage
              src={packData.attachments[0].url}
              placeholder={packData.attachments[0].thumbnailUrl}
            >
              {(src, loading) => (
                <img
                  style={{
                    filter: loading ? 'blur(8px)' : 'none',
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
              position: isScrolled ? 'absolute' : 'relative',
              top: isScrolled ? 0 : -150,
              fontSize: isScrolled ? 22 : 40,
              padding: isScrolled ? 15 : 0,
              width: '100%',
              textAlign: 'center',
              marginLeft: isScrolled ? -4 : 0,
              backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.8)' : '',
              // transform: isScrolled ? 'scale(0.5) translateY(-30px)' : 'none',
              transition: 'font-size 0.3s ease',
              borderRadius: '0 0 4px 4px'
            }}
          >
            {packData.name}
          </h1>
          <span
            style={{
              position: 'relative',
              marginTop: isScrolled ? -60 : -140,
              display: 'flex',
              justifyContent: 'space-around',
              opacity: isScrolled ? 0 : 1,
            }}
          >
            <span>{numberToRoundedWord(packData.downloadCount)} downloads</span>
            <span>
              by {packData.authors.map(author => author.name).join(', ')}
            </span>
            <span>Last update: yesterday</span>
          </span>
          <div className={styles.description}>
            <span
              dangerouslySetInnerHTML={{
                __html: packData.fullDescription
              }}
            />
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </Modal>
  );
};
