import React from 'react';
import { Carousel } from 'antd';
import ContentLoader from 'react-content-loader';
import styles from './News.scss';

const News = props => (
  <div className={styles.container}>
    {props.news.length !== 0 ? (
      <Carousel infinite autoplay style={{ height: '180px' }}>
        {props.news.map(inf => {
          return (
            <a
              href={inf.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ height: 140 }}
              key={`news-${inf.title}`}
            >
              <div
                style={{
                  background: `linear-gradient(rgba(44, 62, 80, 0), rgba(44, 62, 80, 0.8), rgba(44, 62, 80, 1)), url(${inf.image})`,
                  backgroundSize: 'cover',
                  height: '180px',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out'
                }}
                className={styles.imgBg}
              />
              <div
                className={styles.imgText}
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  pointerEvents: 'none',
                  fontSize: 20,
                  top: 90,
                  display: 'inline-block',
                  paddingLeft: 10
                }}
              >
                {inf.title} <br />
                <span style={{ fontSize: 14 }}>{inf.description}</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 140,
                  height: 40,
                  width: '100%'
                }}
              />
            </a>
          );
        })}
      </Carousel>
    ) : (
      <div
        style={{
          width: '100%',
          background: 'var(--secondary-color-1)'
        }}
      >
        <ContentLoader
          height={180}
          speed={0.6}
          ariaLabel={false}
          primaryColor="var(--secondary-color-2)"
          secondaryColor="var(--secondary-color-3)"
          style={{
            height: '180px',
            maxWidth: '1050px'
          }}
        >
          <rect x="16" y="100" rx="0" ry="0" width="200" height="20" />
          <rect x="16" y="130" rx="0" ry="0" width="400" height="20" />
        </ContentLoader>
      </div>
    )}
  </div>
);

export default News;
