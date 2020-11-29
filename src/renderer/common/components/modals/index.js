import { lazy } from 'react';
import modals from 'src/renderer/_APP_TARGET_/components/modals';
import AsyncComponent from '../AsyncComponent';

export default {
  ...modals,
  Login: AsyncComponent(lazy(() => import('./Login')))
};
