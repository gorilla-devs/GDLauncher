import React, { forwardRef } from "react";
import styled from "styled-components";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { transparentize } from "polished";

export default function ExampleWrapper({
  // Are there more items to load?
  // (This information comes from the most recent API request.)
  hasNextPage,

  // Are we currently loading a page of items?
  // (This may be an in-flight flag in your Redux store for example.)
  isNextPageLoading,

  // Array of items loaded so far.
  items,

  height,

  width,

  setStep,
  // Callback function responsible for loading the next page of items.
  loadNextPage
}) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;
  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = index => !hasNextPage || index < items.length;

  // Render an item or a loading indicator.
  const Item = ({ index, style }) => {
    let content;
    const modpack = items[index];
    if (!isItemLoaded(index)) {
      content = <div css={style}>Loading...</div>;
    }
    if (!modpack) return null;

    const primaryImage = modpack.attachments.find(v => v.isDefault);
    content = (
      <ModpackContainer
        style={{
          ...style,
          top: style.top + 8,
          height: style.height - 8
        }}
        key={modpack.id}
        bg={primaryImage.thumbnailUrl}
      >
        <Modpack>
          <div>{modpack.name}</div>
        </Modpack>
        <ModpackHover>
          <div onClick={() => setStep(1)}>Download</div>
          <div>Explore</div>
        </ModpackHover>
      </ModpackContainer>
    );

    return content;
  };

  const innerElementType = forwardRef(({ style, ...rest }, ref) => (
    <div
      ref={ref}
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        ...style,
        paddingTop: 8
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  ));

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <List
          height={height}
          width={width}
          itemCount={itemCount}
          itemSize={80}
          onItemsRendered={onItemsRendered}
          innerElementType={innerElementType}
          ref={ref}
        >
          {Item}
        </List>
      )}
    </InfiniteLoader>
  );
}

const ModpackContainer = styled.div`
  position: relative;
  width: 100%;
  background: url('${props => props.bg}');
  background-repeat: no-repeat;
  background-size: cover;
  margin: 10px 0;
  transition: height 0.2s ease-in-out;
  border-radius: 4px;
`;

const Modpack = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  padding: 0 10px;
  background: ${props => transparentize(0.4, props.theme.palette.grey[700])};
`;

const ModpackHover = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  background: ${props => transparentize(0.7, props.theme.palette.grey[700])};
  opacity: 0;
  padding-left: 40%;
  will-change: opacity;
  transition: opacity 0.1s ease-in-out, background 0.1s ease-in-out;
  div {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    border-radius: 4px;
    transition: background-color 0.1s ease-in-out;
    &:hover {
      background-color: ${props => props.theme.palette.primary.main};
    }
  }
  &:hover {
    opacity: 1;
  }
`;
