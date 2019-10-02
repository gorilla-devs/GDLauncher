import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
  palette: {
    common: {
      black: '#000',
      white: '#fff'
    },
    primary: {
      light: '#3f8d8f',
      main: '#0F7173',
      dark: '#0a4f50'
    },
    secondary: {
      light: '#ff6333',
      main: '#ff3d00',
      dark: '#b22a00'
    },
    error: {
      light: '#de6967',
      main: '#D64441',
      dark: '#952f2d'
    },
    grey: {
      50: '#F0F0F1',
      100: '#E1E2E4',
      200: '#D2D4D6',
      300: '#B5B8BC',
      400: '#979CA1',
      500: '#7A8086',
      600: '#5D646C',
      700: '#49515A',
      800: '#353E48',
      900: '#353E48',
      A100: '#212B36',
      A200: '#1C242D',
      A400: '#101419'
    },
    text: {
      disabled: 'rgba(255, 255, 255, 0.38)',
      hint: 'rgba(255, 255, 255, 0.38)',
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.54)'
    },
    type: 'dark'
  },
  spacing: factor => [0, 4, 8, 16, 32, 64][factor],
  sizes: {
    width: {
      sidebar: '172px'
    },
    height: {
      systemNavbar: '23px',
      navbar: '36px'
    }
  }
});
