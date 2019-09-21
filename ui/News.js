import React, { useState } from 'react';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

const Carousel = styled.div`
  width: 788px;
  height: 100%;
  border-radious: 2px;
  ...props.style;
`;

const ImageSlider = styled.ul`
  display: flex;
  justify-content: space-between;
  position: absolute;
  padding: 0;
  margin: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
`;

const Slide = styled.li`
  display: inline;
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  margin0 2px 0 2px;
  z-index: 0;
`;

const ImageSlide = styled.img`
  position: absolute;
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
  width: 158px;
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

function ImageList(props) {
  const news = props.news;
  const listImages = news.map((inf, i) => (
    <Slide>
      <Title>{inf.title}</Title>
      <SubTitle>{inf.description}</SubTitle>
      <Gradient />
      <ImageSlide key={i} image={inf.image} />
    </Slide>
  ));

  return <ImageSlider>{listImages}</ImageSlider>;
}
function News(props: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <Carousel style={props.style}>
      <Select>
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
        <SelectElement />
      </Select>
      <ImageList news={props.news} />
    </Carousel>
  );
}

export default News;
