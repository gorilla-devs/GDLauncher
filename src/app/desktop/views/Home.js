import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Instances from "../components/Instances";
import News from "../components/News";
import { addToQueue } from "../../../common/reducers/actions";
import { _getCurrentDownloadItem } from "../../../common/utils/selectors";
import { openModal } from "../../../common/reducers/modals/actions";

const AddInstanceIcon = styled(Button)`
  position: absolute;
  bottom: 20px;
  left: 20px;
`;

const Home = () => {
  const dispatch = useDispatch();
  const news = useSelector(state => state.news);
  const downloadItem = useSelector(_getCurrentDownloadItem) || {};

  const openAddInstanceModal = () => {
    dispatch(openModal("AddInstance"));
  };

  return (
    <div>
      <News news={news} />
      <button
        type="button"
        onClick={() => dispatch(addToQueue(`TEST ${Math.random()}`, "19w42a"))}
        css=""
      >
        Compute {downloadItem.percentage}
      </button>
      <Instances />
      <AddInstanceIcon color="primary" onClick={openAddInstanceModal}>
        <FontAwesomeIcon icon={faPlus} />
      </AddInstanceIcon>
    </div>
  );
};

export default Home;
