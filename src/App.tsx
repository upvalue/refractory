import React from 'react';

const App = () => {
  return (
    <div className="App flex justify-center pt4">
      <div className="flex">

        <div className="sidebar mr4 p2">
          <h3 className="h3 mb2">Refractory</h3>

          <p>This editor is the worst thing ever. If you have to use it, approach with caution.</p>

          <br />

          <p>Text with one set of <em>_underscores_</em> or <em>*asterisks*</em>&nbsp; is <em>italicized</em>.</p>

          <br />

          <p>Text with two sets of <strong>__underscores__</strong> or <strong>**asterisks**</strong>&nbsp; is <strong>bolded</strong>.</p>

          <br />

          <ul>
            <li>Type an asterisk to begin a list</li>
          </ul>

          <p>
            The source of this thing is at <a href="https://github.com/upvalue/refractory">GitHub</a>.
          </p>
        </div>

        <div className="p2">
          Editor goes here
        </div>
      </div>
    </div>
  );
}

export default App;
