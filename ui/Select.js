import React from 'react';
import styled from 'styled-components';

const Select = styled.select`
  margin: 0;
  width: ${props => props.width || '100px'};
  height: ${props => props.height || '24px'};
  font-family: Glacial Indifference;
  font-size: 13px;
  line-height: 16px;
  background: transparent;
  border-radius: 5px;
  color: #e1e2e4;
  border: 2px solid #0f7173;
  ...props.style;
  option {
    background: #0f7173;
    border-radius: 5px;
    border: 2px solid #0f7173;
  }
`;

type Props = {};

function GDSelect(props: Props) {
  return (
    <Select>
      <option value="0">featured</option>
      <option value="1">Audi</option>
      <option value="2">BMW</option>
    </Select>
  );
}

export default GDSelect;
