import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import { EditorSelection, Text } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { autocompletion } from '@codemirror/autocomplete';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';

function posToOffset(doc: Text, pos: any) {
  return doc.line(pos.line).from + pos.ch
}

function offsetToPos(doc: any, offset: any) {
  let line = doc.lineAt(offset);
  return {line: line.number - 1, ch: offset - line.from};
}

const TextEditor = forwardRef(({ code, onChangeCode, lineError, charError, toggle, setCurrLineNo }: any, ref) => {
  const editor = useRef<HTMLDivElement>(null);
  const splitCodeByLine = code.split('\n');
  const doc = Text.of(splitCodeByLine);
  const cursorOffset = useRef(0);
  
  const onChangeCodeMirrorValue = (value: string) => {
    onChangeCode(value);
  };

  const { setContainer, view } = useCodeMirror({
    autoFocus: true,
    container: editor.current,
    height: '100%',
    width: '100%',
    theme: "dark",
    selection: EditorSelection.cursor(cursorOffset.current),
    extensions: [python(), autocompletion({ activateOnTyping: false }), indentationMarkers()],
    value: code,
    onChange: onChangeCodeMirrorValue
  });

  useEffect(() => {
    if (lineError === 0) {
      cursorOffset.current = posToOffset(doc, { line: splitCodeByLine.length, ch: 0});
    } else {
      cursorOffset.current = posToOffset(doc, { line: lineError, ch: charError - 1 });
    }  
    if (!view?.hasFocus) {
      view?.focus();
    }
    view?.dispatch({ selection: EditorSelection.cursor(cursorOffset.current) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineError, charError, toggle]);

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.current]);

  useEffect(() => {
    setCurrLineNo(view?.state?.doc.lineAt(view?.state?.selection.main.head).number);
  }, [view?.state?.selection]);

  useImperativeHandle(ref, () => ({
    getFocusStateEditor() {
      return view?.hasFocus;
    }
  }));

  return (
    <>
      <div style={{height: '10%', fontFamily: 'Arial, Helvetica, sans-serif'}} className='pt-2'>
        <p className='title-text'>Lập Trình</p>
      </div>
      <div id='editor' ref={editor}/>
    </>
  );
})

export default TextEditor;
