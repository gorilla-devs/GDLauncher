/* eslint-disable */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Editable, withReact, useSlate, Slate } from 'slate-react';
import { Editor, Transforms, createEditor } from 'slate';
import { useDebouncedCallback } from 'use-debounce';
import { withHistory } from 'slate-history';
import { Button } from 'antd';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faCode,
  faQuoteRight,
  faListOl,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { updateInstanceConfig } from '../../reducers/actions';
import { _getInstancesPath, _getInstance } from '../../utils/selectors';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const Notes = ({ instanceName }) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const dispatch = useDispatch();

  const instance = useSelector(state => _getInstance(state)(instanceName));
  const [value, setValue] = useState(instance.notes || initialValue);

  const updateNotes = useDebouncedCallback(
    v => {
      dispatch(
        updateInstanceConfig(instanceName, config => ({ ...config, notes: v }))
      );
    },
    1500,
    { maxWait: 4000 }
  );

  return (
    <MainContainer>
      <Container>
        <Slate
          editor={editor}
          value={value}
          onChange={notes => {
            setValue(notes);
            updateNotes(notes);
          }}
        >
          <Toolbar>
            <MarkButton format="bold" icon={faBold} />
            <MarkButton format="italic" icon={faItalic} />
            <MarkButton format="underline" icon={faUnderline} />
            <MarkButton format="code" icon={faCode} />
            <BlockButton format="heading-one" icon="h1" />
            <BlockButton format="heading-two" icon="h2" />
            <BlockButton format="block-quote" icon={faQuoteRight} />
            <BlockButton format="numbered-list" icon={faListOl} />
            <BlockButton format="bulleted-list" icon={faList} />
          </Toolbar>
          <TextEditorContainer>
            <TextEditor
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Enter some notes..."
              spellCheck
              autoFocus
            />
          </TextEditorContainer>
        </Slate>
      </Container>
    </MainContainer>
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
    type: isActive ? 'paragraph' : isList ? 'list-item' : format
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
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
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
    <BlockInnerButton
      css={`
        margin: 0 2px;
        border: ${props => `solid 2px ${props.theme.palette.primary.main}`};
      `}
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {typeof icon === 'string' ? (
        <div>{icon}</div>
      ) : (
        <FontAwesomeIcon icon={icon} />
      )}
    </BlockInnerButton>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <MarkInnerButton
      css={`
        margin: 0 2px;
        border: ${props => `solid 2px ${props.theme.palette.primary.main}`};
      `}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <FontAwesomeIcon icon={icon} />
    </MarkInnerButton>
  );
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
];

export default Notes;

const MainContainer = styled.div`
  height: 100%;
  margin-top: 20px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Toolbar = styled.div`
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const TextEditorContainer = styled.div`
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow-x: hidden;
`;

const TextEditor = styled(Editable)`
  width: 100%;
  max-width: 100%;
  display: inline-block;
  margin-top: 20px;
  overflow-x: auto;
  word-break: break-word;
  border: ${props => `solid 2px ${props.theme.palette.primary.main}`};
`;

const MarkInnerButton = styled(({ active, ...props }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Button {...props} />
))``;

const BlockInnerButton = styled(({ active, ...props }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Button {...props} />
))``;