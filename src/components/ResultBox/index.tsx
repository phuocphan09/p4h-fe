import React from 'react';
import Typed from 'react-typed';

function ResultBox(props: any) {
    const content = props.content;
    const isTyping = props.isTyping;
    return (
        <>
            <div style={{height: '30px', fontFamily: 'Arial, Helvetica, sans-serif'}} className='pt-2'>
                <p className='title-text'>Kết quả</p>
            </div>
            <div className='result-wrapper'>
                { isTyping ?
                    (
                        <Typed typeSpeed={20} strings={[content]} style={{ marginTop: '0px', whiteSpace: 'pre-wrap', color: '#72A24D', fontFamily: '"Courier New", Courier, monospace', fontSize: '20px'}}></Typed>
                    ) // speed = 20 for defaultRate = 1.2
                    :
                    (
                        <p style={{ marginTop: '0px', whiteSpace: 'pre-wrap', color: '#72A24D', fontFamily: '"Courier New", Courier, monospace', fontSize: '20px'}}>{content}</p>
                    )
                }
            </div>
        </>
    );
}

export default ResultBox;
