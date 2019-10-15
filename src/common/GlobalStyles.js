import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  html,
  body {
    font-family: Roboto, Helvetica, sans-serif;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  a {
    -webkit-user-drag: none;
  }

  a:hover {
    text-decoration: none;
  }

  hr {
    border-width: 1px 0 0;
    border-top-style: solid;
    border-right-style: initial;
    border-bottom-style: initial;
    border-left-style: initial;
    border-top-color: rgba(255, 255, 255, 0.4);
    border-right-color: initial;
    border-bottom-color: initial;
    border-left-color: initial;
    border-image: initial;
    margin: 15px 0;
  }

  img {
    -webkit-user-drag: none;
    -webkit-transform:translate3d(0,0,0);
  }

  ::-webkit-scrollbar {
    width: 8px;
    border-radius: 1px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.shade3};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-track {
    background-color: ${props => props.theme.shade11};
    border-radius: 1px;
  }
`;
