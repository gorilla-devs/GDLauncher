import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { push } from "connected-react-router";
import styled from "styled-components";
import { login } from "../../../common/reducers/actions";
import { load } from "../../../common/reducers/loading/actions";
import features from "../../../common/reducers/loading/features";
import { downloadArr } from "../utils/downloader";
import background from "../../../common/assets/fullHdBackground.jpg";
import { Input, CheckBox, Button } from "../../../ui";

const Background = styled.div`
  background-image: url("${background}");
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div`
  background: black;
  opacity: 0.5;
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
`;

const Form = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 290px;
  height: 200px;
  vertical-align: middle;
  margin-left -145px;
  left: 50%;
  margin-top -75px;
  top: 50%;
`;

const Login = () => {
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);

  const dispatch = useDispatch();

  downloadArr([]);

  const authenticate = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(login(email, password)))
    ).catch(console.error);
  };

  return (
    <Background>
      <Overlay>
        <Form>
          <Input
            // disabled={isAuthLoading}
            name="username"
            width="290"
            height="34"
            placeholder="Email"
            onChange={({ target: { value } }) => setEmail(value)}
            // onKeyPress={onKeyPressEnter}
          />
          <Input
            // disabled={isAuthLoading}
            name="password"
            width="290"
            height="34"
            placeholder="Password"
            type="password"
            onChange={({ target: { value } }) => setPassword(value)}
            // onKeyPress={onKeyPressEnter}
          />
          <div
            css={`
              display: inline;
            `}
          >
            <Button
              variant="contained"
              color="primary"
              // loading={isAuthLoading}
              // disabled={isAuthLoading || !email || !password}
              onClick={authenticate}
              css={`
                float: right;
              `}
            >
              Login
            </Button>
            <CheckBox color="primary" />
          </div>
          {/* {nativeLauncherProfiles && (
            <Button
              icon="forward"
              loading={isAuthLoading}
              size="large"
              color="primary"
              onClick={tryLoginFromNativeLauncher}
            >
              <span>
                Login As&nbsp;
                <span
                  css={`
                    font-style: italic;
                    text-decoration: underline;
                  `}
                >
                  {nativeLauncherProfiles}
                </span>
              </span>
            </Button>
          )} */}
        </Form>
        <button type="button" onClick={() => dispatch(push("/home"))}>
          TEST
        </button>
        {/* <div
          css={`
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
          `}
        >
          <div>
            <input name="username" {...username} />
            <input type="password" name="password" {...password} />
            <button type="button" onClick={authenticate}>
              Login
            </button>
          </div>
        </div> */}
      </Overlay>
    </Background>
  );
};

export default Login;
