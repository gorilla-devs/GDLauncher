import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path),
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path)::after,
  :not(input):not(textarea):not(button):not(span):not(div):not(a):not(i):not(span):not(svg):not(path)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
  }

  a {
    -webkit-user-drag: none;
  }

  a:hover {
    text-decoration: none;
  }

  :focus { outline: none; }
`;
