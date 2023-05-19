import React, { useEffect, useState } from 'react';
import { ListGroup, Form } from 'react-bootstrap';

export default function NavigationCenter({ menuLstInit, runFunc }: any) {
  const [searchTxt, setSearchTxt] = useState('');
  const [menuLst, setMenuLst] = useState(menuLstInit);
  const handleRunFunc = (funcName: string) => {
    runFunc(funcName);
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setSearchTxt(e.target.value);
  }

  useEffect(() => {
    const menuFiltered = menuLstInit.filter((menu: any) => {
      const keywordJoinedStr = menu.keyword.join(' ');
      return keywordJoinedStr.includes(searchTxt);
    });
    setMenuLst(menuFiltered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTxt]);

  return (
    <ListGroup variant='flush'>
      <div className='p-2'>
        <div className='mb-2'>
          <Form.Control type='text' placeholder='Tìm kiếm...' onChange={handleSearch} value={searchTxt} className='rounded-0'/>
        </div>
        {menuLst?.map((menu: any) => {
          return <ListGroup.Item action onClick={() => handleRunFunc(menu.funcName)}>{menu.title}</ListGroup.Item>;
        })}
      </div>
    </ListGroup>
  );
}
