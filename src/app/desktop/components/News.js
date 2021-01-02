import React, { useState, useEffect, useRef, useContext } from 'react';
import ContentLoader from 'react-content-loader';
import styled, { ThemeContext } from 'styled-components';
import { shell } from 'electron';
import { useSelector } from 'react-redux';

const Carousel = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: ${props => props.theme.shape.borderRadius};
  cursor: pointer;
  display: inline-block;
`;

const ImageSlider = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  object-fit: covert;
  overflow: hidden;
  border-radius: ${props => props.theme.shape.borderRadius};
  justify-content: space-between;
  padding: 0;
  margin: 0;
  margin: 0 auto 0 auto;
  width: 1000%;
  height: 100%;
  z-index: 0;
  transform: translate(${props => `${props.currentImageIndex}px`});
  transition: transform 0.3s ease-in-out;
`;

// padding: 200px;
const ImageSlide = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  border-radius: ${props => props.theme.shape.borderRadius};
  background-image: url('${props => (props.image ? props.image : null)}');
  background-position: center;
  background-size: cover;
  transition: transform 0.2s ease-in-out;
  z-index: -1;
`;

const Slide = styled.div`
  display: inline-block;
  position: relative;
  top: 0;
  width: 100%;
  border-radius: 2px;
  z-index: 0;
  &:hover ${ImageSlide} {
    transform: scale(1.06);
  }
`;

const Gradient = styled.div`
  height: 100%;
  width: 100%;
  border-radius: ${props => props.theme.shape.borderRadius};
  background-image: linear-gradient(
    0deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(165, 165, 165, 0) 80%
  );
  opacity: 0.99;
  z-index: 1;
  &&:hover {
  }
`;

const Select = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  top: 160px;
  left: 50%;
  margin-left: -100px;
  padding: 0;
  width: 200px;
  height: 5px;
  z-index: 2;
`;

const SelectElement = styled.div`
  width: 16px;
  height: 5px;
  flex: 1;
  margin: 0 2px 0 2px;
  cursor: pointer;
  background: ${props => props.theme.palette.grey[50]};
  opacity: 0.6;
  transition: flex-grow 0.2s ease-in-out;
  border-radius: 2px;
  &:hover {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.palette.grey[50]};
    opacity: 0.79;
    vertical-align: middle;
  }
  &:active {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.palette.grey[50]};
    opacity: 1;
    vertical-align: middle;
  }

  &:nth-child(${props => props.currentImageIndex}) {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.palette.grey[50]};
    opacity: 1;
    vertical-align: middle;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  position: absolute;
  bottom: 50px;
  left: 15px;
  z-index: 2;
`;

const SubTitle = styled.p`
  color: ${props => props.theme.palette.text.primary};
  position: absolute;
  bottom: 30px;
  left: 15px;
  z-index: 2;
`;

function openNews(e, inf) {
  e.preventDefault();
  shell.openExternal(inf.url);
}

function ImageList({ currentImageIndex, news }) {
  const listImages = news.map(inf => (
    <Slide key={inf.title} onClick={e => openNews(e, inf)}>
      <Title>{inf.title}</Title>
      <SubTitle>{inf.description}</SubTitle>
      <Gradient />
      <ImageSlide image={inf.image} />
    </Slide>
  ));

  return (
    <ImageSlider currentImageIndex={-1000 * currentImageIndex}>
      {listImages}
    </ImageSlider>
  );
}

function SelectNews(props) {
  const { news } = props;
  const { setCurrentImageIndex } = props;
  const selectElementList = news.map((inf, i) => (
    <SelectElement
      key={inf.url}
      onClick={() => setCurrentImageIndex(i)}
      currentImageIndex={props.currentImageIndex + 1}
    />
  ));

  return <Select>{selectElementList}</Select>;
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function News({ style, news }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ContextTheme = useContext(ThemeContext);
  const showNews = useSelector(state => state.settings.showNews);

  useInterval(
    () => {
      if (currentImageIndex < 9) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else setCurrentImageIndex(0);
    },
    showNews ? 5000 : null
  );

  if (!showNews) return null;
  return news.length !== 0 ? (
    <Carousel style={style}>
      <SelectNews
        news={news}
        setCurrentImageIndex={setCurrentImageIndex}
        currentImageIndex={currentImageIndex}
      />
      <ImageList news={news} currentImageIndex={currentImageIndex} />
    </Carousel>
  ) : (
    <ContentLoader
      speed={2}
      width={1000}
      height={180}
      viewBox="0 0 1000 180"
      foregroundColor={ContextTheme.palette.grey[900]}
      backgroundColor={ContextTheme.palette.grey[800]}
      title={false}
    >
      {/* <rect x="0" y="0" rx="0" ry="0" width="1000" height="1080" /> */}
      <rect width="20" height="180" />
      <rect x="980" width="20" height="180" />
      <rect
        x="490"
        y="-490"
        transform="matrix(-1.836970e-16 1 -1 -1.836970e-16 510 -490)"
        width="20"
        height="1000"
      />
      <rect
        x="490"
        y="-330"
        transform="matrix(-1.836970e-16 1 -1 -1.836970e-16 670 -330)"
        width="20"
        height="1000"
      />

      <rect x="40.5" y="100" width="304" height="14.4" />
      <rect x="40.5" y="125.6" width="304" height="14.4" />
    </ContentLoader>
  );
}

export default News;
