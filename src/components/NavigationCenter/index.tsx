import React, { useEffect, useState, useRef } from 'react';
import { ListGroup, Form } from 'react-bootstrap';

export default function NavigationCenter({ menuLstInit, runFunc, SpeakSpeech }: any) {
  const [searchTxt, setSearchTxt] = useState('');
  const [menuLst, setMenuLst] = useState(menuLstInit);
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    if (activeIdx >= 0) {

      // TODO: hard code for demo, change this
      if (menuLst[activeIdx].title === 'Giải thích code bằng ChatGPT') {
        SpeakSpeech('Giải thích code bằng', false);
        SpeakSpeech('ChatGPT', true, 'en-US');
      } else {
        SpeakSpeech(menuLst[activeIdx].title);
      }
    }
  }, [activeIdx]);

  const handleKeyDownNavigate = (e: any) => {
    if (e.keyCode == 38 && activeIdx >= 0) { // up
      e.preventDefault();
      setActiveIdx(currIdx => currIdx - 1);
    } else if (e.keyCode == 40 && activeIdx < menuLst.length - 1) { // down
      e.preventDefault();
      setActiveIdx(currIdx => currIdx + 1);
    } else if (e.keyCode == 13 && activeIdx >= 0) { // enter
      runFunc(menuLst[activeIdx]);
    }
  }

  const handleRunFunc = (menu: any) => {
    runFunc(menu);
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setActiveIdx(-1); // reset search index to beginning of the list
    setSearchTxt(e.target.value);
  }

  useEffect(() => {
    const menuFiltered = menuLstInit.filter((menu: any) => {

      const removeVietnameseDiacritics = function(text: string) {
        return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      }

      const keywordJoinedStr = removeVietnameseDiacritics(menu.keyword.join(' ').toLowerCase());

      return keywordJoinedStr.includes(removeVietnameseDiacritics(searchTxt.toLowerCase()));
    });
    setMenuLst(menuFiltered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTxt]);

  return (
    <ListGroup variant='flush' onKeyDown={handleKeyDownNavigate}>
      <div className='p-2'>
        <div className='mb-2'>
          <Form.Control autoFocus={true} type='text' placeholder='Tìm kiếm...' onChange={handleSearch} value={searchTxt} className='rounded-0'/>
        </div>
        {menuLst?.map((menu: any, i: any) => {
          return <ListGroup.Item action onClick={() => handleRunFunc(menu)} active={i == activeIdx} as={'div'}>{menu.title}</ListGroup.Item>;
        })}
      </div>
    </ListGroup>
  );
}
