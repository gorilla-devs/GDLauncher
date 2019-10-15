import React from "react";
import { useDispatch } from "react-redux";
import { push } from "connected-react-router";

const Home = props => {
  const dispatch = useDispatch();

  return (
    <div>
      Welcome!{" "}
      <button type="button" onClick={() => dispatch(push("/home"))}>
        Go to home
      </button>
    </div>
  );
};

export default Home;
