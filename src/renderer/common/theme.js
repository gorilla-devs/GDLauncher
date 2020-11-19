module.exports = {
  palette: {
    common: {
      black: '#000',
      white: '#fff'
    },
    primary: {
      light: '#5A7391',
      main: '#365076',
      dark: '#2B4066'
    },
    secondary: {
      light: '#54636D',
      main: '#1B2533',
      dark: '#050818'
    },
    error: {
      light: '#DE6967',
      main: '#D64441',
      dark: '#952f2d'
    },
    grey: {
      50: '#B7C5C8',
      100: '#A3B1B6',
      200: '#909EA4',
      300: '#7C8A92',
      400: '#687780',
      500: '#54636D',
      600: '#2D3C49',
      700: '#1B2533',
      800: '#121929',
      900: '#050818'
    },
    colors: {
      red: '#D64441',
      yellow: '#FAB849',
      lavander: '#BB6BD9',
      green: '#27AE60',
      blue: '#3FA7D6',
      lightBlue: '#345995',
      liberty: '#6761a8',
      jungleGreen: '#43aa8b',
      maximumRed: '#d62828',
      darkYellow: '#f18805',
      orange: '#f26430'
    },
    text: {
      disabled: 'rgba(255, 255, 255, 0.38)',
      hint: 'rgba(255, 255, 255, 0.38)',
      primary: '#E1E2E4',
      secondary: '#D2D4D6',
      third: '#979CA1',
      icon: '#F0F0F1'
    },
    type: 'dark'
  },
  action: {
    hover: 'rgba(255, 255, 255, 0.1)',
    selected: 'rgba(255, 255, 255, 0.2)'
  },
  duration: {
    longer: 0.3,
    main: 0.2,
    shorter: 0.1
  },
  shape: { borderRadius: '4px' },
  spacing: factor => [0, 4, 8, 16, 32, 64][factor],
  sizes: {
    width: {
      sidebar: 172
    },
    height: {
      systemNavbar: 45
    }
  }
};
