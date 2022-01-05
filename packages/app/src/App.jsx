import React, { useState } from "react";
import { FixedSizeList as List } from "react-window";
import { styled } from "goober";
import "./App.css";
import { hi } from "./util/index";
import { ButtonUI } from "ui";

const Button = styled("button")`
  background: #2f855a;
  color: white;
  border-radius: 4px;
`;

function App() {
  const [count, setCount] = useState(0);
  hi();

  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{ width: "100%", height: "70px", background: "#2F855A" }}
        ></div>
        <div
          style={{
            width: 100,
            height: 800,
            background: "#171923",
            position: "absolute",
            left: 0,
            top: 70,
          }}
        />
        <svg
          width="326"
          height="362"
          viewBox="0 0 326 362"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M326 106.553C326 95.3946 320.003 85.0974 310.299 79.5908L178.284 4.68192C168.795 -0.702713 157.173 -0.702228 147.684 4.68321L15.6988 79.5903C5.99548 85.0973 0 95.3938 0 106.551V255.449C0 266.606 5.99549 276.903 15.6988 282.41L147.684 357.317C157.173 362.702 168.795 362.703 178.284 357.318L310.299 282.409C320.003 276.903 326 266.605 326 255.447V106.553Z"
            fill="#2F855A"
          />
          <path
            d="M162.979 271.471C190.749 271.471 213.269 249.335 213.269 222.038V213.646C213.269 212.918 213.72 212.285 214.396 212.031C222.193 208.96 268.23 188.788 262.174 144.169C255.634 96.0977 194.873 103.634 164.235 132.357C163.526 133.022 162.463 133.022 161.787 132.357C131.149 103.634 70.3881 96.0977 63.8481 144.169C57.7592 188.788 103.797 208.96 111.625 212.031C112.302 212.285 112.753 212.95 112.753 213.646V222.038C112.721 249.367 135.208 271.471 162.979 271.471Z"
            fill="white"
          />
          <path
            d="M141.484 176.216C141.645 177.926 139.487 178.844 138.359 177.546C134.686 173.334 127.663 167.349 115.872 164.119C96.5417 158.862 117.032 147.652 124.957 151.293C132.109 154.618 140.002 159.242 141.484 176.216Z"
            fill="#2F855A"
          />
          <path
            d="M184.526 176.217C184.365 177.927 186.523 178.845 187.651 177.547C191.324 173.335 198.347 167.35 210.138 164.12C229.468 158.863 208.978 147.653 201.053 151.295C193.901 154.62 186.008 159.243 184.526 176.217Z"
            fill="#2F855A"
          />
          <path
            d="M174.373 201.39C177.014 207.121 181.235 218.585 177.562 226.692C177.047 227.832 175.468 228.022 174.63 227.103C171.602 223.747 166.222 215.355 171.054 201.58C171.602 200.06 173.728 199.965 174.373 201.39Z"
            fill="#2F855A"
          />
          <path
            d="M151.622 201.39C148.981 207.121 144.76 218.585 148.433 226.692C148.948 227.832 150.527 228.022 151.365 227.103C154.393 223.747 159.773 215.355 154.941 201.58C154.425 200.06 152.299 199.965 151.622 201.39Z"
            fill="#2F855A"
          />
        </svg>

        <p>Hello Vite + React!</p>
        <p>
          <Button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </Button>
          <ButtonUI />
        </p>
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {" | "}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
      <List height={300} itemCount={10000000} itemSize={35} width={300}>
        {Row}
      </List>
    </div>
  );
}

const Row = ({ index, style }) => <div style={style}>Row {index}</div>;

export default App;
