import React from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../common/reducers/modals/actions";

function DesktopRoot() {
  const dispatch = useDispatch();
  return (
    <div onClick={() => dispatch(openModal("Test"))}>This is a desktop app</div>
  );
}

export default DesktopRoot;
