import React from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../common/reducers/modals/actions";
import navbar from "../../../common/navBar/index";
import { CheckBox, Button } from "../../../ui/index";

const Home = props => {
  const dispatch = useDispatch();

  return (
    <div>
      <navbar />
      Home{" "}
      <button onClick={() => dispatch(openModal("Test"))}>Open Modal</button>
    </div>
  );
};

export default Home;
