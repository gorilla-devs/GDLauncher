import React from 'react';
import { Carousel } from 'antd';
import styles from './News.scss';

const News = props =>
  (
    <div className={styles.container}> {console.log(props)}
      <Carousel autoplay vertical effect="fade" style={{ height: '180px' }}>
        {props.news.news.filter(inf => !inf.tags.includes('demo')).map(inf => {
          return (
            <div
              style={{
                background: `linear-gradient( rgba(44, 62, 80, 0), rgba(44, 62, 80, 1)), url(${inf.content['en-us'].image})`,
                height: '180px',
                backgroundPosition: 'center'
              }}>
              {inf.content['en-us'].text}
            </div>
          );
        })}
      </Carousel >
    </div>
  );

export default News;
