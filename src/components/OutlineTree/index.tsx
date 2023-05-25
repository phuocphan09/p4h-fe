import React, { useEffect, useRef, useState } from 'react';
import { ListGroup } from 'react-bootstrap';

export default function OutlineTree({ data, goToLine, SpeakSpeech }: any) {
  const firstActiveIdx = data.active_index;
  const [activeIdx, setActiveIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.focus();
    if (activeIdx >= 0) {
      SpeakSpeech(`${data.parsed_line[activeIdx].label} at level ${data.parsed_line[activeIdx].level}`, false, 'en-US');
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
      goToLine(data.parsed_line[activeIdx].line + 1);
      SpeakSpeech(`Bạn đã được đưa về vị trí đã lựa chọn, ở dòng ${data.parsed_line[activeIdx].line + 1}`);
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
              goToLine(outlineItem.line + 1);
            }}
            active={activeIdx >= 0 ? (activeIdx === i) : (firstActiveIdx === i)}
            as={'div'}
            style={{paddingLeft: `${10+ 20 * outlineItem.level}px`}}
          >
            {outlineItem.label}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
