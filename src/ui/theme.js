import { ConfigProvider } from 'antd';
import React from 'react';
import App from '../common/reducers/app';

export const themeConfigs = () => (
  <ConfigProvider>
    <App />
  </ConfigProvider>
);

let themesExport;
ConfigProvider.config({
  let: (themesExport = {
    theme: {
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
    }
  })
});

export const theme = {
  palette: {
    common: {
      black: themesExport.theme.palette.common.black,
      white: themesExport.theme.palette.common.white
    },
    primary: {
      light: themesExport.theme.palette.primary.light,
      main: themesExport.theme.palette.primary.main,
      dark: themesExport.theme.palette.primary.dark
    },
    secondary: {
      light: themesExport.theme.palette.secondary.light,
      main: themesExport.theme.palette.secondary.main,
      dark: themesExport.theme.palette.secondary.dark
    },
    error: {
      light: themesExport.theme.palette.error.light,
      main: themesExport.theme.palette.error.main,
      dark: themesExport.theme.palette.error.dark
    },
    grey: {
      50: themesExport.theme.palette.grey['50'],
      100: themesExport.theme.palette.grey['100'],
      200: themesExport.theme.palette.grey['200'],
      300: themesExport.theme.palette.grey['300'],
      400: themesExport.theme.palette.grey['400'],
      500: themesExport.theme.palette.grey['500'],
      600: themesExport.theme.palette.grey['600'],
      700: themesExport.theme.palette.grey['700'],
      800: themesExport.theme.palette.grey['800'],
      900: themesExport.theme.palette.grey['900']
    },
    colors: {
      red: themesExport.theme.palette.colors.red,
      yellow: themesExport.theme.palette.colors.yellow,
      lavander: themesExport.theme.palette.colors.lavander,
      green: themesExport.theme.palette.colors.green,
      blue: themesExport.theme.palette.colors.blue,
      lightBlue: themesExport.theme.palette.colors.lightBlue,
      liberty: themesExport.theme.palette.colors.liberty,
      jungleGreen: themesExport.theme.palette.colors.jungleGreen,
      maximumRed: themesExport.theme.palette.colors.maximumRed,
      darkYellow: themesExport.theme.palette.colors.darkYellow,
      orange: themesExport.theme.palette.colors.orange
    },
    text: {
      disabled: themesExport.theme.palette.text.disabled,
      hint: themesExport.theme.palette.text.hint,
      primary: themesExport.theme.palette.text.primary,
      secondary: themesExport.theme.palette.text.secondary,
      third: themesExport.theme.palette.text.third,
      icon: themesExport.theme.palette.text.icon
    },
    type: themesExport.theme.palette.type
  },
  action: {
    hover: themesExport.theme.action.hover,
    selected: themesExport.theme.action.selected
  },
  duration: {
    longer: themesExport.theme.duration.longer,
    main: themesExport.theme.duration.main,
    shorter: themesExport.theme.duration.shorter
  },
  shape: themesExport.theme.shape,
  spacing: themesExport.theme.spacing,
  sizes: {
    width: {
      sidebar: themesExport.theme.sizes.width.sidebar
    },
    height: {
      systemNavbar: themesExport.theme.sizes.height.systemNavbar
    }
  }
};
