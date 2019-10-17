import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';

const StyledButton = styled(Button)`
  color: ${props => props.theme.palette.text.primary};
  background: ${props =>
    props.color === "primary" ? props.theme.palette.primary.main : props.color};
  transition: all 0.09s ease-in-out;
  &&:hover {
    background: ${props =>
      props.color === "primary"
        ? props.theme.palette.primary.main
        : props.color};
    opacity: 0.7;
  }
  &&:active {
    background: ${props =>
      props.color === "primary"
        ? props.theme.palette.primary.main
        : props.color};
    opacity: 0.7;
  }
`;

function GDSelect(props) {
  return (
    <StyledButton
      color={props.color}
      txtColor={props.txtColor}
      css={props.css}
      style={props.style}
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </StyledButton>
  );
}

export default GDSelect;
