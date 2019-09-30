import React, { useState } from 'react';
import styled from 'styled-components';
import arrow from '../../GDLauncher/app/assets/images/selectArrow.svg';
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

const Options = styled.div`
  display: ${props => (props.opened ? 'block' : 'none')};
  position: relative;
  width: ${props => props.width || '100px'};
  height: ${props => (props.opened ? '100px' : 0)};
  background: transparent;
  border-radius: 5px;
  color: #e1e2e4;
  border: 2px solid #0f7173;
  margin-top: 5px;
`;

const SelectedOption = styled.p`
  font-family: Glacial Indifference;
  font-size: 14px;
  line-height: 16px;
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
  return (
    <div style={{ maxHeigth: '2000px', position: 'relative' }}>
      <Select onClick={() => setIsOpened(!isOpened)}>
        {/* <option value="0">featured</option>
      <option value="1">Audi</option>
    <option value="2">BMW</option> */}
        <SelectedOption>featured</SelectedOption>
      </Select>
      <Icon
        opened={isOpened}
        onClick={() => setIsOpened(!isOpened)}
        icon={faCaretDown}
      />
      <Options opened={isOpened}></Options>
    </div>
  );
}

export default GDSelect;
