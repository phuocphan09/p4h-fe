import React from 'react';
import { ListGroup } from 'react-bootstrap';

export default function OutlineTree({ data, goToLine }: any) {
    return <ListGroup variant='flush'>
        {data.map((outlineItem: any) => {
            return (<>
                <ListGroup.Item action onClick={() => { goToLine(outlineItem.line + 1) }}>{outlineItem.label}</ListGroup.Item>
                {outlineItem?.childNodes?.length ? <div className='ps-4'><OutlineTree data={outlineItem.childNodes} goToLine={goToLine}/></div> : '' }
            </>)
        })}
    </ListGroup>
}