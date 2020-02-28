/* eslint-disable */
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Button } from "antd";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faCode,
  faListOl,
  faList,
  faQuoteRight
} from "@fortawesome/free-solid-svg-icons";
import { updateInstanceConfig } from "../../reducers/actions";
import { _getInstancesPath, _getInstance } from "../../utils/selectors";

const Toolbar = styled.div`
  height: 40px;
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const StyledEditable = styled(Editable)`
  min-height: 400px;
  max-height: 95%;
  min-width: 98%;
  max-width: 98%;
  margin-top: 20px;
  padding: 5px;
  overflow: hidden;
  background: ${props => props.theme.palette.grey[900]};
  border: ${props => `solid 2px ${props.theme.palette.primary.main}`};
`;

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const Notes = ({ instanceName }) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const dispatch = useDispatch();
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const notes = instance.notes || initialValue;

  return (
    <div
      css={`
        width: 100%;
        height: 100%;
      `}
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          height: 100%;
        `}
      >
        <Slate
          editor={editor}
          value={notes}
          onChange={notes => {
            dispatch(
              updateInstanceConfig(instanceName, config => {
                return {
                  ...config,
                  notes
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
            <BlockButton format="heading-one" icon="H1" />
            <BlockButton format="heading-two" icon="H2" />
            <BlockButton format="block-quote" icon={faQuoteRight} />
            <BlockButton format="numbered-list" icon={faListOl} />
            <BlockButton format="bulleted-list" icon={faList} />
          </Toolbar>
          <div
            css={`
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
            `}
          >
            <StyledEditable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Enter some Notes"
              autoFocus
              spellCheck={false}
              onKeyDown={event => {
                for (const hotkey in HOTKEYS) {
                  if (isHotkey(hotkey, event)) {
                    event.preventDefault();
                    const mark = HOTKEYS[hotkey];
                    toggleMark(editor, mark);
                  }
                }
              }}
            />
          </div>
        </Slate>
      </div>
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
      css={`
        height: 36px;
        padding: 5px 10px;
        border: ${props => `solid 2px ${props.theme.palette.primary.main}`};
        margin: 2px;
      `}
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {typeof icon === "string" ? (
        icon
      ) : (
        <FontAwesomeIcon
          css={`
            margin: 0;
          `}
          icon={icon}
        />
      )}
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      css={`
        height: 36px;
        padding: 5px 10px;
        border: ${props => `solid 2px ${props.theme.palette.primary.main}`};
        margin: 2px;
      `}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <FontAwesomeIcon
        css={`
          margin: 0;
        `}
        icon={icon}
      />
    </Button>
  );
};

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }]
  }
];

export default Notes;
