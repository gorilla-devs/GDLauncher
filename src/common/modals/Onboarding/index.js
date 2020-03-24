// import React from "react";
// import styled from "styled-components";
// import { Spin, message } from "antd";
// import { useSelector, useDispatch } from "react-redux";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTrash } from "@fortawesome/free-solid-svg-icons";
// import Modal from "../../components/Modal";
// import { _getAccounts, _getCurrentAccount } from "../../utils/selectors";
// import { openModal, closeModal } from "../../reducers/modals/actions";
// import {
//   updateCurrentAccountId,
//   loginWithAccessToken,
//   updateAccount,
//   removeAccount
// } from "../../reducers/actions";
// import { load } from "../../reducers/loading/actions";
// import features from "../../reducers/loading/features";

// const Onboarding = () => {
//   const dispatch = useDispatch();
//   const accounts = useSelector(_getAccounts);
//   const currentAccount = useSelector(_getCurrentAccount);
//   const isLoading = useSelector(state => state.loading.accountAuthentication);
//   return (
//     <Modal
//       css={`
//         height: 70%;
//         width: 400px;
//         max-height: 700px;
//       `}
//     >
//       <Container>Hello</Container>
//     </Modal>
//   );
// };

// export default Onboarding;

// const Container = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   align-content: space-between;
// `;

// const AccountItem = styled.div`
//   display: flex;
//   align-items: center;
//   position: relative;
//   flex: 1;
//   justify-content: space-between;
//   height: 40px;
//   padding: 0 10px;
//   color: white;
//   border-radius: 4px;
//   cursor: pointer;
//   ${props =>
//     props.active ? `background: ${props.theme.palette.primary.main};` : ""}
//   transition: background 0.1s ease-in-out;
//   &:hover {
//     ${props =>
//       props.active ? "" : `background: ${props.theme.palette.grey[500]};`}
//   }
// `;

// const HoverContainer = styled.div`
//   position: absolute;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   left: 0;
//   align-items: center;
//   cursor: pointer;
//   font-size: 18px;
//   font-weight: 800;
//   border-radius: 4px;
//   transition: opacity 150ms ease-in-out;
//   width: 100%;
//   height: 100%;
//   opacity: 0;
//   backdrop-filter: blur(4px);
//   will-change: opacity;
//   &:hover {
//     opacity: 1;
//   }
// `;

// const AccountsContainer = styled.div`
//   width: 100%;
//   height: 100%;
// `;

// const AccountContainer = styled.div`
//   display: flex;
//   position: relative;
//   width: 100%;
//   justify-content: space-between;
//   align-items: center;
// `;
