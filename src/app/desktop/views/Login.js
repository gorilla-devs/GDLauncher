import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Input, Checkbox, Button } from "antd";
import { login } from "../../../common/reducers/actions";
import { load } from "../../../common/reducers/loading/actions";
import features from "../../../common/reducers/loading/features";
import background from "../../../common/assets/fullHdBackground.jpg";

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
            <Checkbox color="primary" />
          </div>
        </Form>
      </Overlay>
    </Background>
  );
};

export default Login;
