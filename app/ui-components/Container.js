import React from 'react';
import { makeStyles, styled } from '@material-ui/styles';
import Container from '@material-ui/core/Container';

const GDContainer = styled(Container)({ });

export default function StyledComponents(props) {
  return <GDContainer {...props} />;
}