import React, { useState, useEffect } from 'react';
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
// transform: translate(${props => -788 * (props.imageIndex + 1)})
const ImageSlider = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  margin: 0 auto 0 auto;
  width: 1000%;
  height: 100%;
  z-index: 0;
  transform: translate(${props => -788 * (props.imageIndex + 1)});
`;

const Slide = styled.div`
  display: inline-block;
  position: relative;
  top: 0;
  height: 158px%;
  width: 100%;
  margin0 2px 0 2px;
  background-size: cover;
  background-position: center;
  z-index: 0;
`;

const ImageSlide = styled.img`
  position: absolute;
  display: block;
  top: 0;
  height: 100%;
  width: 100%;
  background-image: url(${props => (props.image ? props.image : null)});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  z-index: -1;
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

type Props = {
  title: string,
  news: Object,
  description: string
};

// function openNews(inf) {
//   console.log(inf.url);
// }

function ImageList(props) {
  const currentImageIndex = props.currentImageIndex;
  const news = props.news;
  const listImages = news.map((inf, i) => (
    <Slide key={i}>
      <Title>{inf.title}</Title>
      <SubTitle>{inf.description}</SubTitle>
      <Gradient />
      <ImageSlide image={inf.image} />
    </Slide>
  ));

  return <ImageSlider imageIndex={props.imageIndex}>{listImages}</ImageSlider>;
}

function SelectNews(props) {
  const news = props.news;
  const setCurrentImageIndex = props.setCurrentImageIndex;
  const selectElementList = news.map((inf, i) => (
    <SelectElement key={i} onClick={() => setCurrentImageIndex(i)} />
  ));

  return <Select>{selectElementList}</Select>;
}

function News(props: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  useEffect(() => {
    console.log(currentImageIndex);
  }, [currentImageIndex]);

  return (
    <Carousel style={props.style}>
      <SelectNews
        news={props.news}
        setCurrentImageIndex={setCurrentImageIndex}
        currentImageIndex={currentImageIndex}
      />
      {/* <Select>
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
      </Select>
       */}
      <ImageList news={props.news} imageIndex={currentImageIndex} />
    </Carousel>
  );
}

export default News;
