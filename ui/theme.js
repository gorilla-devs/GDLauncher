import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
  primary: '#0F7173',
  shade1: '#F0F0F1',
  shade2: '#E1E2E4',
  shade3: '#D2D4D6',
  shade4: '#B5B8BC',
  shade5: '#979CA1',
  shade6: '#7A8086',
  shade7: '#5D646C',
  shade8: '#49515A',
  shade9: '#353E48',
  shade10: '#353E48',
  shade11: '#212B36',
  shade12: '#1C242D',
  shade13: '#101419',
  red: '#D64441',
  yellow: '#FAB849',
  green: '#27AE60',
  purple: '#BB6BD9',
  blue: '#3FA7D6',
  darkBlue: '#203753',
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
