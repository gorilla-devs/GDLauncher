import React from "react";
import { useDispatch } from "react-redux";
import { push } from "connected-react-router";

const Login = props => {
  const dispatch = useDispatch();

  return (
    <div>
      Hello{" "}
      <button type="button" onClick={() => dispatch(push("/home"))}>
        Login
      </button>
    </div>
  );
};

export default Login;
