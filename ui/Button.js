import React from 'react';
import styled from 'styled-components';
import MDButton from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const Progress = styled(CircularProgress)`
  color: white;
`;

const Button = styled(MDButton)`
  margin: ${props => props.theme.spacing(1)};
  display: 'flex';
  alignitems: 'center';
`;

export default function StyledComponents({ children, ...props }) {
  return (
    <Button
      variant="contained"
      color="primary"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {props.loading && <Progress size={15} />}
      {children}
    </Button>
  );
}
