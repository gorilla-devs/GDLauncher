import React from 'react';
import styled from 'styled-components';

const Input = styled.input`
  width: ${props => props.width || '90px'};
  height: ${props => props.width || '30px'};;
  padding 10px;
  background: transparent;
  border-radius: 5px;
  border: 2px solid #0f7173;
  color: #e1e2e4;
  font-family: Glacial Indifference;
  font-size: 14px;
  line-height: 16px;
  margin: 0 !important;

  &:hover {
    transition: all 0.1s ease-in-out;
    background: #212b36;
    opacity: 10%;
    border: 2px solid #0f7173;
  }

  &:active {
    transition: all 0.1s ease-in-out;
    background: #212b36;
    opacity: 10%;
    border: 2px solid #0f7173;
  }

`;

type Props = {
  placeholder: string
  //   children: React.node
};

function GDInput(props: Props) {
  return (
    <Input
      name={props.name}
      type={props.type}
      placeholder={props.placeholder}
      width={props.width}
      height={props.height}
    />
  );
}

export default GDInput;
