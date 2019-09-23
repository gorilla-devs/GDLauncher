import React, { useState, useEffect, useRef } from 'react';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';
import { shell } from 'electron';

const Carousel = styled.div`
  width: 788px;
  height: 100%;
  overflow: hidden;
  border-radious: 2px;
  ...props.style;
`;

const ImageSlider = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  border-radius: 2px;
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

const ImageSlide = styled.img`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  padding: 100px;
  border-radius: 2px;
  background-image: url(${props => (props.image ? props.image : null)});
  background-position: center;
  background-size: cover;
  transition: transform 0.3s ease-in-out;
  object-fit: cover;
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
    transform: scale(1.5);
  }
`;

const Gradient = styled.div`
  height: 100%;
  width: 100%;
  border-radious: 2px;
  background-image: linear-gradient(
    0deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(165, 165, 165, 0) 80%
  );
  opacity: 0.9;
  z-index: 1;
`;

const Select = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 15px;
  padding: 0;
  margin: 0;
  width: 200px;
  height: 5px;
  left: 50%;
  margin-left: -79px;
  z-index: 2;
`;

const SelectElement = styled.div`
  width: 16px;
  height: 5px;
  flex: 1;
  margin: 0 2px 0 2px;
  cursor: pointer;
  background: ${props => props.theme.secondaryColor_shade_1};
  opacity: 0.6;
  transition: flex-grow 0.2s ease-in-out;
  border-radius: 2px;
  &:hover {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.secondaryColor_shade_1};
    opacity: 0.79;
    vertical-align: middle;
  }
  &:active {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.secondaryColor_shade_1};
    opacity: 1;
    vertical-align: middle;
  }

  &:nth-child(${props => props.currentImageIndex}) {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.secondaryColor_shade_1};
    opacity: 1;
    vertical-align: middle;
  }
`;

const Title = styled.h1`
  position: absolute;
  bottom: 50px;
  left: 15px;
  z-index: 2;
`;

const SubTitle = styled.p`
  position: absolute;
  bottom: 30px;
  left: 15px;
  z-index: 2;
`;

const StyledContentLoader = styled(ContentLoader)`
  height: 180px;
  speed: 0.6;
  arialabel: false;
  primarycolor: ${props => props.theme.secondaryColor_shade_11};
  secondarycolor: ${props => props.theme.secondaryColor_shade_11};
  height: 180px;
  maxwidth: 1050px;
`;

type Props = {
  title: string,
  news: Object,
  description: string
};

function openNews(e, inf) {
  e.preventDefault();
  shell.openExternal(inf.url);
}

function ImageList(props) {
  const currentImageIndex = props.currentImageIndex;
  const news = props.news;
  const listImages = news.map((inf, i) => (
    <Slide key={i} onClick={e => openNews(e, inf)}>
      <Title>{inf.title}</Title>
      <SubTitle>{inf.description}</SubTitle>
      <Gradient />
      <ImageSlide image={inf.image} />
    </Slide>
  ));

  return (
    <ImageSlider currentImageIndex={-788 * props.currentImageIndex}>
      {listImages}
    </ImageSlider>
  );
}

function SelectNews(props) {
  const news = props.news;
  const setCurrentImageIndex = props.setCurrentImageIndex;
  const selectElementList = news.map((inf, i) => (
    <SelectElement
      key={i}
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
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function News(props: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useInterval(() => {
    if (currentImageIndex < 9) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else setCurrentImageIndex(0);
  }, 5000);

  return props.news.length !== 0 ? (
    <Carousel style={props.style}>
      <SelectNews
        news={props.news}
        setCurrentImageIndex={setCurrentImageIndex}
        currentImageIndex={currentImageIndex}
      />
      <ImageList news={props.news} currentImageIndex={currentImageIndex} />
    </Carousel>
  ) : (
    <StyledContentLoader>
      <rect x="16" y="100" rx="0" ry="0" width="200" height="20" />
      <rect x="16" y="130" rx="0" ry="0" width="400" height="20" />
    </StyledContentLoader>
  );
}

export default News;
