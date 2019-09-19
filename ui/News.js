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
  display: block;
  text-decorations: none;
  background: #f0f0f1;
  opacity: 0.6;
  border-radius: 2px;
`;

function News(props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <Carousel>
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
      <ImageSlide url={props.url} style={props.style} />
    </Carousel>
  );
}

export default News;
