import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`

body, h1, h2, p {
    color: white;
  
}

body{
  touch-action: manipulation;
}


::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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
  
     

`;
