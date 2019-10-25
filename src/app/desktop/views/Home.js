import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Instances from "../components/Instances";
import News from "../components/News";
import { openModal } from "../../../common/reducers/modals/actions";

const AddInstanceIcon = styled(Button)`
  && {
    position: fixed;
    bottom: 20px;
    left: 20px;
  }
`;

const Home = () => {
  const dispatch = useDispatch();
  const news = useSelector(state => state.news);

  const openAddInstanceModal = () => {
    dispatch(openModal("AddInstance"));
  };

  return (
    <div>
      <News news={news} />
      <Instances />
      <AddInstanceIcon color="primary" onClick={openAddInstanceModal}>
        <FontAwesomeIcon icon={faPlus} />
      </AddInstanceIcon>
    </div>
  );
};

export default Home;
