import React, { useRef } from 'react';
// import Editor from './editor';
// import './editor.css';

const App = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const actionReset = () => {
    console.log('reset pressed');
  }

  return (
    <div className="App flex justify-center pt3">
      <div className="flex">

        <div className="sidebar mr4">
          <div className="p2">
            <h3 className="mb2">Refractory</h3>

            <div className="buttons">
              <button onClick={actionReset}>Reset</button>
            </div>
          </div>
        </div>

        <div className="p2" ref={ref}>
          <div className="rf-editor-line">Click to edit</div>
        </div>
      </div>
    </div>
  );
}

export default App;
