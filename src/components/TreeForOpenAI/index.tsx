import React from 'react';
import { ListGroup } from 'react-bootstrap';

export default function TreeForOpenAI({ data, setLineRange }: any) {
    return <ListGroup variant='flush'>
        {data.map((outlineItem: any) => {
            return (<>
                <ListGroup.Item action onClick={() => { setLineRange(outlineItem.line, outlineItem.last_line) }}>{outlineItem.label}</ListGroup.Item>
                {outlineItem?.childNodes?.length ? <div className='ps-4'><TreeForOpenAI data={outlineItem.childNodes} setLineRange={setLineRange}/></div> : '' }
            </>)
        })}
    </ListGroup>
}