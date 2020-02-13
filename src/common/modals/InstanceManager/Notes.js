import React from "react";
import styled from "styled-components";
import { Editor, MenuBar } from "@aeaton/react-prosemirror";
import { options, menu } from "@aeaton/react-prosemirror-config-default";
import { useDispatch } from "react-redux";
import { updateInstanceConfig } from "../../reducers/actions";

const Container = styled.div`
  margin-left: 5%;
`;

const Input = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  color: black;
`;

const Notes = () => {
  const dispatch = useDispatch();
  const instanceName = "modpack";
  return (
    <Container>
      <Input>
        <Editor
          options={options}
          onChange={doc => {
            dispatch(
              updateInstanceConfig(instanceName, config => {
                return {
                  ...config,
                  doc
                };
              })
            );
            console.log("cose", JSON.stringify(doc, null, 2));
          }}
          render={({ editor, view }) => (
            <>
              <MenuBar menu={menu} view={view} />

              {editor}
            </>
          )}
        />
      </Input>
    </Container>
  );
};

export default Notes;
