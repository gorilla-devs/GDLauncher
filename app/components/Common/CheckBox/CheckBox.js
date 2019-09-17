import React from 'react';
import styled from 'styled-components';

const Div = styled.div`
  width: ${props => props.width || '30px'};
  height: ${props => props.width || '30px'};
`;

const CheckBox = styled.input`
  width:30px;
  height: 30px;
  padding 10px;
  background: #0f7173;
  border-radius: 20%;
  border: 2px solid #0f7173;
  color: red;
  margin: 0 !important;

  &:active {
    transition: all 0.1s ease-in-out;
    color: #e1e2e4;
    border: 2px solid #0f7173;
  }

`;

type Props = {
  // checked: Bool
  //   children: React.node
};

function GDCheckBox(props: Props) {
  return (
    <Div width={props.width} height={props.height}>
      {props.checked ? (
        <CheckBox
          type="checkbox"
          checked
          width={props.width}
          height={props.height}
        />
      ) : (
        <CheckBox type="checkbox" width={props.width} height={props.height} />
      )}
    </Div>
  );
}

export default GDCheckBox;
