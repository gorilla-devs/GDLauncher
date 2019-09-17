import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 65px;
  height: 10px;
  border-radius: 10px;
`;

const Checkbox = styled.input.attrs({
  type: 'checkbox'
})`
  display: none;
`;

const Slider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;

  cursor: pointer;
  background-color: #979ca1;
  border-radius: 30px;

  ${Checkbox}:checked + & {
    background-color: #0f7173;
  }

  ${Checkbox}:focus + & {
    box-shadow: 0 0 1px #0f7173;
  }

  &:before {
    position: absolute;
    content: '';
    left: 3px;
    bottom: 2px;

    transition: 0.4s;

    height: 26px;
    width: 26px;
    background-color: #d2d4d6;
    border-radius: 50%;

    ${Checkbox}:checked + & {
      transform: translateX(33px);
    }
  }
`;

const Switch = props => (
  <Wrapper>
    {props.checked ? <Checkbox checked /> : <Checkbox />}
    <Slider />
  </Wrapper>
);

export default Switch;
