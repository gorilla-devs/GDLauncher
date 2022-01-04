import React, { useState } from "react";
import logo from "./logo.svg";
import { FixedSizeList as List } from "react-window";
import { styled } from "goober";
import "./App.css";
import { hi } from "./util/index";
import { ButtonUI } from "ui";

const Button = styled("button")`
  background: dodgerblue;
  color: white;
  border: ${Math.random()}px solid white;

  &:focus,
  &:hover {
    padding: 1em;
  }
`;

function App() {
  const [count, setCount] = useState(0);
  hi();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
