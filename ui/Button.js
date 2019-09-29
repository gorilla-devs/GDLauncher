import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
width: ${props => props.width || '90px'};
height: ${props => props.width || '30px'};
  padding 3px;
  background: transparent;
  border-radius: 2px;
  border: 2px solid transparent;
  color: ${props => props.theme.secondaryColor_shade_2};
  font-family: Glacial Indifference;
  font-size: 14px;
  line-height: 16px;
  margin: 0 !important;

  &:hover {
    transition: all 0.1s ease-in-out;
    background: ${props => props.theme.secondaryColor_shade_11};
    opacity: 10%;
    border: 2px solid ${props => props.theme.secondaryColor_shade_11};
  }

  // &:active {

//   background: ${props => props.theme.primaryColor};
//   border: 2px solid ${props => props.theme.primaryColor};
// }

`;

const SelectedButton = styled.button`
width: ${props => props.width || '90px'};
height: ${props => props.width || '30px'};
  padding 3px;
  background: ${props => props.theme.primaryColor};
  border: 2px solid ${props => props.theme.primaryColor};
  border-radius: 2px;
  color: ${props => props.theme.secondaryColor_shade_2};
  font-family: Glacial Indifference;
  font-size: 14px;
  line-height: 16px;
  margin: 0 !important;


`;

type Props = {
  color: string
  //   children: React.node
};

function GDButton(props: Props) {
  return props.selected ? (
    <SelectedButton
      width={props.width}
      height={props.height}
      selected={props.selected}
    >
      {props.children}
    </SelectedButton>
  ) : (
    <Button width={props.width} height={props.height}>
      {props.children}
    </Button>
  );
}

export default GDButton;
