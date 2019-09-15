import styled from 'styled-components';

export const Container = styled.div`
  margin: 0;
  width: 100%;
  height: 40px;
  -webkit-user-select: none;
  display: flex;
  justify-content: space-between;
`;

export const SettingsButton = styled.div`
  font-size: 22px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: white;
    transition: all 0.2s ease-in-out;
  }
  path {
    cursor: pointer;
  }
  path:hover {
    color: white;
    transition: all 0.2s ease-in-out;
  }
`;

export const UpdateButton = styled.div`
  z-index: 10;
  text-align: center;
  a {
    text-decoration: none;
    display: block;
  }
`;

export const NavigationContainer = styled.div`
  -webkit-app-region: no-drag;
  font-family: 'GlacialIndifferenceRegular';
  font-weight: 700;
  font-size: 16px;
  height: 40px;
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

export const NavigationElement = styled.li`
  display: inline;
  cursor: pointer;
  ${props =>
    props.selected
      ? `
  a {
    background: var(--primary);
    border-radius: 2px;
    color: white;
    transition: all 0.25s;
  }
  `
      : `
  &:hover a {
    transition: all .25s;
    background: var(--secondary-color-3);
    border-radius: 2px;
  }
  `}
  &:hover a,
  &:active a,
  &:focus a {
    text-decoration: none !important;
  }
  a {
    position: relative;
    display: inline-block;
    height: 40px;
    width: 150px;
    line-height: 40px;
    color: white;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    svg {
      cursor: pointer;
      path {
        cursor: pointer;
      }
    }
  }
`;
