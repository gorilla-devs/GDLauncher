import React from "react";
import { useInput } from "rooks";
import { useDispatch } from "react-redux";
import { login } from "../../../common/reducers/actions";
import { load } from "../../../common/reducers/loading/actions";
import features from "../../../common/reducers/loading/features";
import { downloadArr } from "../utils/downloader";

const Login = props => {
  const dispatch = useDispatch();
  const username = useInput("");
  const password = useInput("");

  downloadArr([]);

  const authenticate = () => {
    dispatch(
      load(
        features.mcAuthentication,
        dispatch(login(username.value, password.value))
      )
    ).catch(console.error);
  };

  return (
    <div
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
    </div>
  );
};

export default Login;
