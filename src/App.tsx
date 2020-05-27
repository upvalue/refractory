import React, { useRef, useMemo, useState, useEffect } from 'react';

import { TEditor } from './editor/TEditor';
import { useStore } from 'react-redux';

const App = () => {

  // Render the Slate context.
  return (
    <div className="App flex justify-center pt3">
      <div className="flex">

        <div className="sidebar mr4">
          <div className="p2">
            <h3 className="mb2">Refractory</h3>

            <p>document navigation</p>
          </div>
        </div>

        <TEditor />

      </div>
    </div>
  );
}

export default App;
