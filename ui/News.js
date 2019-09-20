import React, { useState } from 'react';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

const Carousel = styled.div`
  width: 788px;
  height: 100%;
  border-radious: 2px;
  ...props.style;
`;

const ImageSlide = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  background-image: url(${props => (props.url ? props.url : null)});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const Gradient = styled.div`
  height: 100%;
  width: 100%;
  border-radious: 2px;
  background: rgb(0, 0, 0);
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(165, 165, 165, 0) 45%
  );
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
`;

const SelectElement = styled.div`
  width: 16px;
  height: 5px;
  flex: 1;
  margin: 0 2px 0 2px;
  display: block;
  text-decorations: none;
  background: ${props => props.theme.secondaryColor_shade_1};
  opacity: 0.6;
  transition: flex-grow 0.3s ease-in-out;
  border-radius: 2px;
  &:hover {
    margin: 0 2px 0 2px;
    flex-grow: 2;
    background: ${props => props.theme.secondaryColor_shade_1};
    opacity: 100;
    vertical-align: middle;
  }
`;

const Title = styled.h1`
  position: absolute;
  bottom: 50px;
  left: 15px;
`;

const SubTitle = styled.p`
  position: absolute;
  bottom: 30px;
  left: 15px;
`;

type Props = {
  title: string,
  news: Object,
  description: string
};

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
      <Gradient />
      {/* {props.news.map((inf, i) => {
        return (
          <>
            <Title>{inf.title}</Title>
            <SubTitle>{inf.description}</SubTitle>
            <ImageSlide image={inf.image} style={props.style} key={i} />
          </>
        );
      })} */}
    </Carousel>
  );
}

export default News;
