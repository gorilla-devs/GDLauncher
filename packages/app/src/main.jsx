import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { setup } from "goober";

setup(React.createElement);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
