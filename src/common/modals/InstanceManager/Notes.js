/* eslint-disable */
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Button } from "antd";
import { promises as fs } from "fs";
import path from "path";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faCode,
  faQuoteRight,
  faListOl,
  faList
} from "@fortawesome/free-solid-svg-icons";
import { updateInstanceConfig } from "../../reducers/actions";
import { _getInstancesPath } from "../../utils/selectors";

// import { Button, Icon, Toolbar } from '../components'

const Toolbar = styled.div`
  height: 40px;
  width: 500px;
  self-align: center;
`;

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const RichTextExample = ({ instanceName }) => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const dispatch = useDispatch();
  const InstancePath = useSelector(_getInstancesPath);
  const configPath = path.join(InstancePath, instanceName, "config.json");

  const getNotes = async () => {

    const notes = JSON.parse(await fs.readFile(configPath));
    console.log("notes", JSON.parse(await fs.readFile(configPath)));
    setValue(notes ? notes : initialValue);
  };

  useEffect(() => {
    // setValue();
    getNotes();
  }, []);

  return (
    <div
      css={`
        && {
          display: flex;
          flex-direction: column;
        }
      `}
    >
      <Slate
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        editor={editor}
        value={value}
        onChange={value => {
          setValue(value),
            dispatch(
              updateInstanceConfig(instanceName, config => {
                return {
                  ...config,
                  value
                };
              })
            );
        }}
      >
        <Toolbar>
          <MarkButton format="bold" icon={faBold} />
          <MarkButton format="italic" icon={faItalic} />
          <MarkButton format="underline" icon={faUnderline} />
          <MarkButton format="code" icon={faCode} />
          <BlockButton format="numbered-list" icon={faListOl} />
          <BlockButton format="bulleted-list" icon={faList} />
        </Toolbar>
        <Editable
          css={`
            max-height: 600px;
            max-width: 600px;
            margin-top: 20px;
            overflow: hidden;
            border: solid 1px white;
          `}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          // spellCheck
          autoFocus
          // onKeyDown={event => {
          //   for (const hotkey in HOTKEYS) {
          //     if (isHotkey(hotkey, event)) {
          //       event.preventDefault();
          //       const mark = HOTKEYS[hotkey];
          //       toggleMark(editor, mark);
          //     }
          //   }
          // }}
        />
      </Slate>
    </div>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <FontAwesomeIcon icon={icon} />
      {/* <Icon>{icon}</Icon> */}
    </Button>
  );
};

const initialValue = [];

export default RichTextExample;
