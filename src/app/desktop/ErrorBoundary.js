import React from 'react';
import { Button } from 'antd';
import { ipcRenderer } from 'electron';
import creeper from '../../common/assets/creeper.png';

export default class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error: error.message };
  }

  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState(prevState => {
      return {
        ...prevState,
        error: prevState.error
          ? `${prevState.error} / ${error.message}`
          : error.message,
        info: info.componentStack || prevState.info
      };
    });
  }

  render() {
    const { error, info } = this.state;
    const { children } = this.props;
    if (error) {
      // You can render any custom fallback UI
      return (
        <div
          css={`
            -webkit-user-select: none;
            user-select: none;
            cursor: default;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px;
          `}
        >
          <img src={creeper} alt="creeper" />
          <h1
            css={`
              color: ${props => props.theme.palette.text.primary};
            `}
          >
            WE’RE SSSSSSORRY. GDLauncher ran into a creeper and blew up..
          </h1>
          <h2
            css={`
              color: ${props => props.theme.palette.text.third};
            `}
          >
            OOPSIE WOOPSIE!! Uwu We make a fucky wucky!! A wittle fucko boingo!
            The code monkeys at our headquarters are working VEWY HAWD to fix
            this!
          </h2>
          <div
            css={`
              margin-top: 20px;
            `}
          >
            {error} <br />
            {info}
          </div>
          <Button
            type="primary"
            onClick={() => {
              ipcRenderer.invoke('appRestart');
            }}
            css={`
              margin-top: 30px;
            `}
          >
            Restart GDLauncher
          </Button>
        </div>
      );
    }
    return children;
  }
}
