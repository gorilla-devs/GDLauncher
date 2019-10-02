import { createMuiTheme } from '@material-ui/core/styles';
import { white } from 'ansi-colors';

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
    }
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

// export default createMuiTheme({
//   primary: '#0F7173',
//   shade1: '#F0F0F1',
//   shade2: '#E1E2E4',
//   shade3: '#D2D4D6',
//   shade4: '#B5B8BC',
//   shade5: '#979CA1',
//   shade6: '#7A8086',
//   shade7: '#5D646C',
//   shade8: '#49515A',
//   shade9: '#353E48',
//   shade10: '#353E48',
//   shade11: '#212B36',
//   shade12: '#1C242D',
//   shade13: '#101419',
//   red: '#D64441',
//   yellow: '#FAB849',
//   green: '#27AE60',
//   purple: '#BB6BD9',
//   blue: '#3FA7D6',
//   darkBlue: '#203753',
//   spacing: factor => [0, 4, 8, 16, 32, 64][factor],
//   sizes: {
//     width: {
//       sidebar: '172px'
//     },
//     height: {
//       systemNavbar: '23px',
//       navbar: '36px'
//     }
//   }
// });
