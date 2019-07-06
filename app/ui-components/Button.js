import React from 'react';
import { makeStyles, styled } from '@material-ui/styles';
import Button from '@material-ui/core/Button';

const GDButton = styled(Button)({
  border: 0,
  borderRadius: 2,
  fontFamily: 'inherit'
});

export default function StyledComponents(props) {
  return <GDButton variant="contained" color="primary" {...props} />;
}