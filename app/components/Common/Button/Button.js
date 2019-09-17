import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
width: ${props => props.width || '90px'};
height: ${props => props.width || '30px'};;
  padding 3px;
  background: transparent;
  border-radius: 2px;
  border: 2px solid transparent;
  color: #e1e2e4;
  font-family: Glacial Indifference;
  font-size: 14px;
  line-height: 16px;
  margin: 0 !important;

  &:hover {
    transition: all 0.1s ease-in-out;
    background: #212b36;
    opacity: 10%;
    border: 2px solid #212b36;
  }

  &:active {
 
    background: #0f7173;
    border: 2px solid #0f7173;
  }

`;

type Props = {
  color: string
  //   children: React.node
};

function GDButton(props: Props) {
  return (
    <Button width={props.width} height={props.height}>
      {props.children}
    </Button>
  );
}

export default GDButton;
