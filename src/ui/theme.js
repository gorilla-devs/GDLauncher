export default {
  palette: {
    common: {
      black: "#000",
      white: "#fff"
    },
    primary: {
      light: "#3f8d8f",
      main: "#0F7173",
      dark: "#0a4f50"
    },
    secondary: {
      light: "#353E48",
      main: "#212B36",
      dark: "#1C242D"
    },
    error: {
      light: "#de6967",
      main: "#D64441",
      dark: "#952f2d"
    },
    grey: {
      50: "#B5B8BC",
      100: "#979CA1",
      200: "#7A8086",
      300: "#5D646C",
      400: "#49515A",
      500: "#353E48",
      600: "#353E48",
      700: "#212B36",
      800: "#1C242D",
      900: "#101419"
    },
    colors: {
      red: "#D64441",
      yellow: "#FAB849",
      purple: "#BB6BD9",
      green: "#27AE60",
      blue: "#3FA7D6",
      darkBlue: "#203753"
    },
    text: {
      disabled: "rgba(255, 255, 255, 0.38)",
      hint: "rgba(255, 255, 255, 0.38)",
      primary: "#E1E2E4",
      secondary: "#D2D4D6",
      third: "#979CA1",
      icon: "#F0F0F1"
    },
    type: "dark"
  },
  action: {
    hover: "rgba(255, 255, 255, 0.1)",
    selected: "rgba(255, 255, 255, 0.2)"
  },
  duration: {
    longer: 0.3,
    main: 0.2,
    shorter: 0.1
  },
  shape: { borderRadius: "4px" },
  spacing: factor => [0, 4, 8, 16, 32, 64][factor],
  sizes: {
    width: {
      sidebar: "172px"
    },
    height: {
      systemNavbar: "23px",
      navbar: "36px"
    }
  }
};
