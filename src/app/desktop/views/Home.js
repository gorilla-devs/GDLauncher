import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Instances from "../components/Instances";
import News from "../components/News";
import { openModal } from "../../../common/reducers/modals/actions";
import { _getCurrentAccount } from "../../../common/utils/selectors";

const AddInstanceIcon = styled(Button)`
  && {
    position: fixed;
    bottom: 20px;
    left: 20px;
  }
`;

const AccountContainer = styled(Button)`
  && {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
  }
`;

const Home = () => {
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);
  const news = useSelector(state => state.news);

  const openAddInstanceModal = () => {
    dispatch(openModal("AddInstance"));
  };

  const openAccountModal = () => {
    dispatch(openModal("AccountsManager"));
  };

  return (
    <div>
      <News news={news} />
      <Instances />
      <AddInstanceIcon color="primary" onClick={openAddInstanceModal}>
        <FontAwesomeIcon icon={faPlus} />
      </AddInstanceIcon>
      <AccountContainer color="primary" onClick={openAccountModal}>
        <div
          css={`
            width: 15px;
            height: 15px;
            background: ${props => props.theme.palette.grey[100]};
            border-radius: 50%;
            margin-right: 10px;
          `}
        />
        {account && account.selectedProfile.name}
      </AccountContainer>
    </div>
  );
};

export default Home;
