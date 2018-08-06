import React from 'react';
import { Carousel } from 'antd';
import styles from './News.scss';

const News = props =>
  (
    <div className={styles.container}>
      <Carousel infinite autoplay style={{ height: '180px' }}>
        {props.news.news.filter(inf => !inf.tags.includes('demo')).map(inf => {
          return (
            <a href={inf.content['en-us'].action} target="_blank" rel="noopener noreferrer" style={{ height: 140 }}>
              <div
                style={{
                  background: `linear-gradient( rgba(44, 62, 80, 0), rgba(44, 62, 80, 0.8), rgba(44, 62, 80, 1)), url(${inf.content['en-us'].image})`,
                  height: '180px',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  transition: 'transform .2s ease-in-out'
                }}
                className={styles.imgBg}
              />
              <div className={styles.imgText} style={{ position: 'absolute', cursor: 'pointer', pointerEvents: 'none', fontSize: 20, top: 100, display: 'inline-block', paddingLeft: 10 }}>
                {inf.content['en-us'].title} <br />
                <span style={{ fontSize: 14 }}>{inf.content['en-us'].text}</span>
              </div>
              <div style={{ position: 'absolute', top: 140, height: 40, width: '100%' }} />
            </a>
          );
        })}
      </Carousel >
    </div>
  );

export default News;
