import React from 'react';
import { TState } from '../store/types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export const Sidebar = () => {
  const documents = useSelector((state: TState) => state.documents);
  return (
    <div className="sidebar mr4">
      <div className="p2">
        <h3>Refractory</h3>

        <div className="mt2">
          <div className="bold">Documents</div>
          {documents.map(d => {
            return <div key={d.id}><Link to={`/document/${d.id}`}>{d.id}</Link></div>
          })}

          <button>+ New document</button>
        </div>
      </div>
    </div>
  );
}