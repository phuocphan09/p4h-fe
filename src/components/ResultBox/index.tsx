import React from 'react';

function ResultBox(props: any) {
  const { content } = props;
  return (
    <>
      <div style={{height: '30px', fontFamily: 'Arial, Helvetica, sans-serif'}} className='pt-2'>
        <p className='title-text'>Kết quả</p>
      </div>
      <div className='result-wrapper'>
        <p style={{ marginTop: '0px', whiteSpace: 'pre-wrap', color:'#72A24D', fontFamily: '"Menlo", monospace' }}>{content}</p>
      </div>
    </>
  );
}

export default ResultBox;
