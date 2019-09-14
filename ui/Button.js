import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.theme.primaryColor};
`;

export default function StyledComponents({ children, ...props }) {
  return <Button type="button">{children}</Button>;
}
