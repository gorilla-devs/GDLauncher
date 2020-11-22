import { lazy } from 'react';
import AsyncComponent from 'src/renderer/common/components/AsyncComponent';

export default {
  ChangeLogs: AsyncComponent(lazy(() => import('./Changelogs'))),
  AccountsManager: AsyncComponent(lazy(() => import('./AccountsManager'))),
  AddAccount: AsyncComponent(lazy(() => import('./AddAccount')))
};
