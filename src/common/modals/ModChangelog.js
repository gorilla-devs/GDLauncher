/* eslint-disable react/no-unescaped-entities */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import ReactHtmlParser from 'react-html-parser';
import { Select } from 'antd';
import ReactMarkdown from 'react-markdown';
import Modal from '../components/Modal';
import { getAddonFileChangelog, getFTBChangelog } from '../api';

let latest = {};
const ModChangelog = ({ modpackId, files, type, modpackName }) => {
  const [changelog, setChangelog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadChangelog = async id => {
    const myLatest = {};
    latest = myLatest;
    setLoading(true);
    let data;
    try {
      if (type === 'ftb') {
        data = await getFTBChangelog(modpackId, id);
      } else {
        data = await getAddonFileChangelog(modpackId, id);
      }
    } catch (err) {
      console.error(err);
    }
    if (latest === myLatest) {
      setChangelog(data);
      setLoading(false);
    }
  };

  const getStateText = () => {
    if (!selectedId) {
      return '';
    }
    if (loading) {
      return 'Loading';
    }
    if (!changelog) {
      return 'Missing changelog';
    }
  };

  return (
    <Modal
      css={`
        height: 500px;
        width: 650px;
      `}
      title="Changelog"
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          text-align: center;
          align-items: center;
        `}
      >
        <Select
          css={`
            width: 400px;
            margin: 10px;
          `}
          onChange={v => {
            setSelectedId(v);
            loadChangelog(v);
          }}
          placeholder="Select a version"
          virtual={false}
        >
          {(files || []).map(v => (
            <Select.Option
              title={
                type === 'ftb' ? `${modpackName} - ${v.name}` : v.displayName
              }
              key={v.id}
              value={v.id}
            >
              {type === 'ftb' ? `${modpackName} - ${v.name}` : v.displayName}
            </Select.Option>
          ))}
        </Select>
        <Changelog>
          {changelog && !loading && selectedId ? (
            <>
              <div
                css={`
                  text-align: center;
                  margin-bottom: 40px;
                `}
              >
                {type === 'ftb'
                  ? `${modpackName} - ${
                      (files || []).find(v => v.id === selectedId)?.name
                    }`
                  : (files || []).find(v => v.id === selectedId)?.displayName}
              </div>
              {type === 'ftb' ? (
                <ReactMarkdown
                  css={`
                    font-size: 15px;
                    padding: 20px;
                  `}
                >
                  {changelog.content}
                </ReactMarkdown>
              ) : (
                ReactHtmlParser(changelog)
              )}
            </>
          ) : (
            <h2
              css={`
                text-align: center;
              `}
            >
              {getStateText()}
            </h2>
          )}
        </Changelog>
      </div>
    </Modal>
  );
};

export default memo(ModChangelog);

const Changelog = styled.div`
  perspective: 1px;
  transform-style: preserve-3d;
  height: 100%;
  width: 100%;
  background: ${props => props.theme.palette.grey[900]};
  word-break: break-all;
  overflow-x: hidden;
  overflow-y: scroll;
  font-size: 20px;
  p {
    text-align: center;
  }
  img {
    max-width: 100%;
    height: auto;
  }
`;
