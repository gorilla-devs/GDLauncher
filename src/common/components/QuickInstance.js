import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { openModal } from '../reducers/modals/actions';

const Container = styled.div`
  height: 100vh;
`;
const DropZone = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  backdrop-filter: blur(4px);
  will-change: opacity;
  transition: opacity 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
`;
const DropZoneBox = styled.div`
  border-radius: 8px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.7);
  border-style: dashed;
  padding: 10px;
  margin: auto;
`;

const QuickInstanceListener = ({ children }) => {
  const dispatch = useDispatch();

  const [dragCounter, setDragCounter] = useState(0);
  const [isShowing, setIsShowing] = useState(false);

  const preventDefault = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const dragEnter = event => {
    preventDefault(event);
    console.info('drag-enter');
    setDragCounter(dragCounter + 1);
  };

  const dragLeave = event => {
    preventDefault(event);
    console.info('drag-leave');
    setDragCounter(dragCounter - 1);
  };

  useEffect(() => {
    if (dragCounter === 1 && !isShowing) {
      setIsShowing(true);
    } else if (dragCounter === 0 && isShowing) {
      setIsShowing(false);
    }
  }, [dragCounter, isShowing]);

  /**
   *
   * @param {React.DragEvent<HTMLDivElement>} event
   */
  const loadQuickInstance = event => {
    // Reset Drag
    setIsShowing(false);
    setDragCounter(0);

    const zipFile = event.dataTransfer.files.item(0);

    if (!zipFile) return;

    dispatch(
      openModal('AddInstance', {
        defaultPage: 2,
        defaultImportZipPath: zipFile.path
      })
    );
  };

  return (
    <Container
      onDrag={preventDefault}
      onDragOver={preventDefault}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
      onDrop={loadQuickInstance}
    >
      <DropZone
        style={{ opacity: isShowing ? 1 : 0, zIndex: isShowing ? 1000 : 0 }}
      >
        <DropZoneBox>Drop your ZIP File here to import</DropZoneBox>
      </DropZone>
      {children}
    </Container>
  );
};

export default React.memo(QuickInstanceListener);
