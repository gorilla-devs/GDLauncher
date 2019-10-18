import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  html {
    height: 100%;
  }

  body {
    height: 100%;   
    overflow: hidden;
    margin: 0;
    display: flex;
  }
  
  #root {
    font-family: Roboto, Helvetica, sans-serif;
    font-size: 14px;
    height: 100%;
    overflow: hidden;
    margin: 0;
    display: flex;
    box-sizing: border-box;
    color: ${props => props.theme.palette.text.primary};
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
    background-color: ${props => props.theme.palette.grey[200]};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-track {
    background-color: ${props => props.theme.palette.grey[900]};
    border-radius: 1px;
  }

  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path),
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path)::after,
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
  }
`;
