import React from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../common/reducers/modals/actions";
import NavBar from "../../../common/components/Navbar";

const Home = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <NavBar />
      Home{" "}
      <button type="button" onClick={() => dispatch(openModal("Test"))}>
        Open Modal
      </button>
    </div>
  );
};

export default Home;
