import React, { useRef, useEffect } from 'react';
import { Refractory } from './Refractory';
import Editor from './editor';

const App = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (ref.current !== null) {
      const editor = new Editor();
      editorRef.current = editor;
      editor.mount(ref.current);
    }
  }, [ref]);

  const actionReset = () => {
    if (!ref.current) return;
    ref.current.innerHTML = `<div className="rf-editor-line">Click to edit</div>`;
  }

  return (
    <div className="App flex justify-center pt4">
      <div className="flex">

        <div className="sidebar mr4">
          <div className="p2">
            <h3 className="h3 mb2">Refractory</h3>

            <div className="buttons">
              {/*<button>Save to localStorage</button>
              <button>Load from localStorage</button>*/}
              <button onClick={actionReset}>Reset</button>
            </div>

            <p>Warning: contenteditable is gross. Approach with caution.</p>

            <h3>### Type pound # then space to create a header</h3>

            <p>Text with one set of <em>_underscores_</em> or <em>*asterisks*</em>&nbsp; is <em>italicized</em>.</p>

            <p>Text with two sets of <strong>__underscores__</strong> or <strong>**asterisks**</strong>&nbsp; is <strong>bolded</strong>.</p>

            <ul className="pl2">
              <li>Type an asterisk to begin a list</li>
              <ul className="pl3">
                <li>Tab to indent, press enter on an empty item to dedent</li>
              </ul>
            </ul>

            <p>
              The source of this thing is at <a href="https://github.com/upvalue/refractory">GitHub</a>.
          </p>
          </div>
        </div>

        <div className="p2" ref={ref} contentEditable={true} suppressContentEditableWarning={true}>
          <div className="rf-editor-line">Click to edit</div>
        </div>
      </div>
    </div>
  );
}

export default App;
