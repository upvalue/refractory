import React, { useRef, useEffect } from 'react';
import Editor from './editor';

type RefractoryProps = {
  children: React.ReactNode;
}

export const Refractory = (props: RefractoryProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (ref.current !== null) {
      const editor = new Editor();
      editorRef.current = editor;
      editor.mount(ref.current);
    }
  }, [ref]);


  return <div className="p2" ref={ref} contentEditable={true} suppressContentEditableWarning={true}>
    <div className="rf-editor-line">Click to edit</div>

  </div>
}