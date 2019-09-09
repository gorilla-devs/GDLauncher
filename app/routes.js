/* eslint flowtype-errors/show-errors: 0 */
import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { Form, notification } from 'antd';
import { bindActionCreators } from 'redux';
import { screen } from 'electron';
import { release, arch } from 'os';
import { initInstances, initNews, loginWithAccessToken } from './reducers/actions';
import { JAVA_URL } from './constants';
import ga from './GAnalytics';
import App from './containers/App';
import { history } from './store/configureStore';
import SideBar from './components/Common/SideBar/SideBar';
import Navigation from './components/Common/WindowNavigation/NavigationBar';
import SysNavBar from './components/Common/SystemNavBar/SystemNavBar';
import { findJavaHome, isGlobalJavaOptions } from './utils/javaHelpers';
import DManager from './components/DManager/DManager';
import InstanceManagerModal from './components/InstanceManagerModal/InstanceManagerModal';
import Settings from './components/Settings/Settings';
import CurseModpacksBrowser from './components/CurseModpacksBrowser/CurseModpacksBrowser';

const Login = lazy(() => import('./components/Login/Login'));
const HomePage = lazy(() => import('./components/Home/Home'));
const AutoUpdate = lazy(() => import('./components/AutoUpdate/AutoUpdate'));
const NewUserPage = lazy(() => import('./components/NewUserPage/NewUserPage'));

const InstanceCreatorModal = lazy(() =>
  import('./components/InstanceCreatorModal/InstanceCreatorModal')
);

const loginHelperModal = lazy(() =>
  import('./components/LoginHelperModal/LoginHelperModal')
);
const CurseModpacksBrowserCreatorModal = lazy(() =>
  import('./components/CurseModpacksBrowserCreatorModal/CurseModpacksBrowserCreatorModal')
);
const CurseModpackExplorerModal = lazy(() =>
  import('./components/CurseModpackExplorerModal/CurseModpackExplorerModal')
);
const ImportPack = lazy(() => import('./components/ImportPack/ImportPack'));
const ExportPackModal = lazy(() =>
  import('./components/ExportPackModal/ExportPackModal')
);
const ChangelogsModal = lazy(() =>
  import('./components/ChangelogModal/ChangelogModal')
);
const ConfirmDeleteModal = lazy(() =>
  import('./components/ConfirmDeleteModal/ConfirmDeleteModal')
);
const JavaGlobalOptionsFixModal = lazy(() =>
  import('./components/JavaGlobalOptionsFixModal/JavaGlobalOptionsFixModal')
);

type Props = {
  location: object,
  loginWithAccessToken: () => void,
  isAuthValid: boolean
};

class RouteDef extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      globalJavaOptions: false
    };
    this.appVersion = require('../package.json').version;
  }

  componentDidMount = async () => {
    const { loginWithAccessToken, initInstances, initNews } = this.props;
    initNews();
    initInstances();
    if (!this.props.isAuthValid) loginWithAccessToken();
    if ((await findJavaHome()) === null) {
      notification.warning({
        duration: 0,
        message: 'JAVA NOT FOUND',
        description: (
          <div>
            Java has not been found. Click{' '}
            <a href={JAVA_URL} target="_blank" rel="noopener noreferrer">
              here
            </a>{' '}
            to download it. After installing you will need to restart your PC.
          </div>
        )
      });
    }
    const globalJavaOptions = await isGlobalJavaOptions();
    this.setState({
      globalJavaOptions
    });
  };

  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = location;
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.isAuthValid && process.env.NODE_ENV !== 'development') {
      ga(this.props.uuid).set('uid', this.props.uuid);
      ga(this.props.uuid).set('ds', 'app');
      ga(this.props.uuid).set('ua', `${release()} ${arch()}`);
      ga(this.props.uuid).set('cd1', `${release()} ${arch()}`);
      // ga(this.props.uuid).set(
      //   'sr',
      //   `${screen.getPrimaryDisplay().bounds.width}x${
      //     screen.getPrimaryDisplay().bounds.height
      //   }`
      // );
      ga(this.props.uuid).set(
        'vp',
        `${window.innerWidth}x${window.innerHeight}`
      );
      ga(this.props.uuid)
        .screenview(this.props.location.pathname, 'GDLauncher', this.appVersion)
        .send();
    }
    if (
      this.state.globalJavaOptions &&
      this.props.location.pathname === '/home'
    ) {
      history.push({
        pathname: `/javaGlobalOptionsFix`,
        state: { modal: true }
      });
      this.setState({ globalJavaOptions: false });
      return;
    }
    /* Show the changelogs after an update */
    if (
      this.props.location.pathname === '/home' &&
      this.props.showChangelog
    ) {
      setTimeout(() => {
        history.push({
          pathname: `/changelogs`,
          state: { modal: true }
        });
      }, 200);
    }
  };

  previousLocation = this.props.location;

  render() {
    const { location, isAuthValid } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render
    return (
      <App>
        <SysNavBar />
        <div>
          {location.pathname !== '/' &&
            location.pathname !== '/newUserPage' &&
            location.pathname !== '/loginHelperModal' && (
              <div>
                <Navigation />
                <SideBar />
              </div>
            )}
          <Switch location={isModal ? this.previousLocation : location}>
            <Route
              exact
              path="/"
              component={WaitingComponent(Form.create()(Login))}
            />
            <Route
              exact
              path="/autoUpdate"
              component={WaitingComponent(AutoUpdate)}
            />
            {/* {!isAuthValid && <Redirect push to="/" />} */}
            <Route path="/newUserPage" component={WaitingComponent(NewUserPage)} />
            <Route>
              <div
                style={{
                  width: 'calc(100% - 200px)',
                  position: 'absolute',
                  right: 200
                }}
              >
                <Route path="/dmanager" component={DManager} />
                <Route
                  path="/curseModpacksBrowser"
                  component={CurseModpacksBrowser}
                />
                <Route path="/home" component={WaitingComponent(HomePage)} />
              </div>
            </Route>
          </Switch>
        </div>
        {/* ALL MODALS */}
        {isModal ? <Route path="/settings/:page" component={Settings} /> : null}
        {isModal ? (
          <Route
            path="/InstanceCreatorModal"
            component={WaitingComponent(InstanceCreatorModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/curseModpackBrowserCreatorModal/:addonID"
            component={WaitingComponent(CurseModpacksBrowserCreatorModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/curseModpackExplorerModal/:addonID"
            component={WaitingComponent(CurseModpackExplorerModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/editInstance/:instance/:page/:state?/:version?/:mod?"
            component={InstanceManagerModal}
          />
        ) : null}
        {isModal ? (
          <Route path="/importPack" component={WaitingComponent(ImportPack)} />
        ) : null}
        {isModal ? (
          <Route
            path="/exportPackModal/:instanceName"
            component={WaitingComponent(ExportPackModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/loginHelperModal"
            component={WaitingComponent(loginHelperModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/changelogs"
            component={WaitingComponent(ChangelogsModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/confirmInstanceDelete/:type/:name"
            component={WaitingComponent(ConfirmDeleteModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/javaGlobalOptionsFix"
            component={WaitingComponent(JavaGlobalOptionsFixModal)}
          />
        ) : null}
      </App>
    );
  }
}

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: 'var(--secondary-color-1)'
          }}
        >
          Loading...
        </div>
      }
    >
      <MyComponent {...props} />
    </Suspense>
  );
}

function mapStateToProps(state) {
  return {
    location: state.router.location,
    isAuthValid: state.loading.account_authentication.isReceived,
    uuid: state.clientToken,
    showChangelog: state.showChangelog
  };
}

const mapDispatchToProps = {
  initNews,
  initInstances,
  loginWithAccessToken
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteDef);
