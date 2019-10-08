import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const Select = styled.div`
  margin: 0;
  width: ${props => props.width || '100px'};
  height: ${props => props.height || '24px'};
  font-family: Glacial Indifference;
  font-size: 13px;
  line-height: 16px;
  border-radius: 5px;
  color: #e1e2e4;
  background: transparent;
  border: 2px solid #0f7173;
  overflow: hidden;
  transition: all 0.15s ease-in-out;
  appearance: none;
  -moz-appearance: none; /* Firefox */
  -webkit-appearance: none; /* Safari and Chrome */
  ::-ms-expand {
    display: none;
  }
  ...props.style;
`;

const Icon = styled(FontAwesomeIcon)`
  width: 7px;
  position: absolute;
  right: 11px;
  top: 5px;
  color: #0f7173;
  transform: ${props => (props.opened ? 'rotate(-180deg)' : 0)};
  transition: transform 0.15s ease-in-out;
`;

// padding: 0 0 0 5px;
// display: ${props => (props.opened ? 'block' : 'none')};
const Options = styled.div`
  position: relative;
  width: ${props => props.width || '100px'};
  height: ${props => (props.opened ? '100px' : 0)};
  background: transparent;
  border-radius: 5px;
  text-decorations: none;
  color: #e1e2e4;
  border: 2px solid #0f7173;
  transform-origin: top;
  transform: ${props => (props.opened ? 'scaleY(1)' : 'scaleY(0)')};
  margin-top: 5px;
  padding: 0;
  overflow: auto;
  transition: transform 0.1s ease-in-out;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const Option = styled.div`
  display: inline-block;
  width: 100%;
  height: 21px;
  padding: 0 0 0 5px;
  white-space: nowrap;
  transition: background 0.15s ease-in-out;
  &:hover {
    background: ${props => props.theme.secondaryColor_shade_11};
  }
`;

const SelectedOption = styled.p`
  font-family: Glacial Indifference;
  font-size: 13px;
  line-height: 17px;
  postion: absolute;
  top: 6px;
  left: 10px;
  margin-left: 10px;
  margin-top: 2px;
  z-index: 0;
`;

type Props = {};

function GDSelect(props: Props) {
  const [isOpened, setIsOpened] = useState(false);
  const [selected, setSelected] = useState('Featured');
  return (
    <div style={{ maxHeigth: '2000px', position: 'relative' }}>
      <Select
        onClick={() => setIsOpened(!isOpened)}
        width={props.width}
        style={props.style}
      >
        <SelectedOption>{selected}</SelectedOption>
      </Select>
      <Icon
        opened={isOpened}
        onClick={() => setIsOpened(!isOpened)}
        icon={faCaretDown}
      />
      <Options opened={isOpened} width={props.width} style={props.style}>
        {props.children
          ? props.children.length > 1
            ? props.children.map(option => (
                <Option onClick={() => setSelected(option)}>{option}</Option>
              ))
            : props.children
          : null}
      </Options>
    </div>
  );
}

export default GDSelect;
