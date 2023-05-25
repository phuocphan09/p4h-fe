import React, { useState, useEffect, useRef } from 'react';
import { ListGroup } from 'react-bootstrap';

export default function TreeForOpenAI({ data, setLineRange, SpeakSpeech }: any) {
  const firstActiveIdx = data.active_index;
  const [activeIdx, setActiveIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.focus();
    if (activeIdx >= 0) {
      SpeakSpeech(data.parsed_line[activeIdx].label, false, 'en-US');
    }
  }, [activeIdx]);

  const handleKeyDownForSelect = (e: any) => {
    if (e.keyCode == 38) {
      e.preventDefault();
      if (activeIdx < 0) {
        setActiveIdx(() => firstActiveIdx - 1);
      } else {
        setActiveIdx((currIdx: any) => currIdx > 0 ? currIdx - 1 : currIdx);
      }
    } else if (e.keyCode == 40 && activeIdx < data.parsed_line.length - 1) {
      e.preventDefault();
      if (activeIdx < 0) {
        setActiveIdx(firstActiveIdx + 1);
      } else {
        setActiveIdx((currIdx: any) => currIdx + 1);
      }
    } else if (e.keyCode == 13 && activeIdx >= 0) {
      setLineRange(data.parsed_line[activeIdx].line, data.parsed_line[activeIdx].last_line);
    }
  };

  return (
    <ListGroup
      variant='flush'
      onKeyDown={handleKeyDownForSelect}
      tabIndex={0}
      ref={listRef}
      autoFocus
      className='outline-list'
    >
      {data.parsed_line.map((outlineItem: any, i: any) => {
        return (
          <ListGroup.Item
            action
            onClick={() => {
              setLineRange(outlineItem.line, outlineItem.last_line);
            }}
            active={activeIdx >= 0 ? (activeIdx === i) : (firstActiveIdx === i)}
            as={'div'}
            style={{paddingLeft: `${10 + 20*outlineItem.level}px`}}
          >
            {outlineItem.label}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
