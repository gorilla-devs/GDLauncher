import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
  primaryColor: '#0F7173',
  shade_1: '#F0F0F1',
  shade_2: '#E1E2E4',
  shade_3: '#D2D4D6',
  shade_4: '#B5B8BC',
  shade_5: '#979CA1',
  shade_6: '#7A8086',
  shade_7: '#5D646C',
  shade_8: '#49515A',
  shade_9: '#353E48',
  shade_10: '#353E48',
  shade_11: '#212B36',
  shade_12: '#1C242D',
  shade_13: '#101419',
  red: '#C3423F',
  yellow: '#FAC05E',
  green: '#27AE60',
  purple: '#BB6BD9',
  light_blue: '#3FA7D6',
  dark_blue: '#203753',
  spacing: factor => [0, 4, 8, 16, 32, 64][factor],
  sizes: {
    width: {
      sidebar: '172px'
    },
    height: {
      systemNavbar: '23px',
      navbar: '40px'
    }
  }
});
