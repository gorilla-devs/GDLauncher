import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  html,
  body {
    font-family: Roboto, Helvetica, sans-serif;
    padding: 0;
    margin: 0;
    overflow: hidden;
    background-color: white;
    ${props => console.log(props)}
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

  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path),
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path)::after,
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
  }

  input,
  button,
  textarea,
  :focus {
    outline: none;
  }

  .slick-dots {
    margin-top: -150px;
  }

  .react-contextmenu {
    background: var(--secondary-color-2);
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 2px;
    color: $text-main-color;
    font-size: 16px;
    margin: 2px 0 0;
    min-width: 180px;
    outline: none;
    transform: scale(0);
    transform-origin: top left;
    /* padding: 5px 0; */
    pointer-events: none;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition: transform 100ms !important;
  }

  .react-contextmenu span {
    display: inline-block;
    color: $text-hover-color;
    padding-bottom: 4px;
  }

  .react-contextmenu.react-contextmenu--visible {
    transition: transform 100ms !important;
    transform: scale(1);
    pointer-events: auto;
    z-index: 9999;
  }

  .react-contextmenu-item {
    background: 0 0;
    color: $text-main-color;
    cursor: pointer;
    font-weight: 400;
    line-height: 1.5;
    padding: 2px 10px;
    text-align: left;
    white-space: nowrap;
    span {
      color: $text-main-color;
      width: 25px;

    }
  }

  .react-contextmenu-item.react-contextmenu-item--active,
  .react-contextmenu-item.react-contextmenu-item--selected,
  .react-contextmenu-item:hover {
    color: $text-hover-color;
    background-color: var(--primary);
    border-color: var(--primary);
    text-decoration: none;
  }

  .react-contextmenu-item.react-contextmenu-item--disabled,
  .react-contextmenu-item.react-contextmenu-item--disabled:hover {
    background-color: transparent;
    border-color: rgba(0, 0, 0, 0.15);
    color: $text-dark;
  }

  .react-contextmenu-item--divider {
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    cursor: inherit;
    margin-bottom: 3px;
    padding: 2px 0;
  }

  .react-contextmenu-item--divider:hover {
    background-color: transparent;
    border-color: rgba(0, 0, 0, 0.15);
  }

  .react-contextmenu-item.react-contextmenu-submenu {
    padding: 0;
  }


  .example-multiple-targets::after {
    content: attr(data-count);
    display: block;
  }

  .container {
    max-width: 24rem;
    margin: 1rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
  }

  .remove-btn {
    margin-right: 0.5rem;
  }

  .fade-enter {
    opacity: 0.01;
  }
  .fade-enter-active {
    opacity: 1;
    transition: opacity 500ms ease-in;
  }
  .fade-exit {
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0.01;
    transition: opacity 500ms ease-in;
  }
  div.transition-group {
    position: relative;
  }
  section.route-section {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }
`;
