import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  spacing: factor => [0, 4, 8, 16, 32, 64][factor]
});

export default theme;
