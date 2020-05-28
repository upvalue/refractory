import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react'
import { NodeEntry, Node, Range, Text } from 'slate';

import { makeEditor } from './lib/editor';
import { markdownRanges } from './lib/markdown';
import { TDocument, TState } from '../store/types';
import { useSelector } from 'react-redux';
import { RenderLeaf } from './RenderLeaf';
import { RenderElement } from './RenderElement';

export type Props = {
}

/**
 * Editor with custom extensions
 */
export const TEditor = (props: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const editor = useMemo(() => withReact(makeEditor()), [])

  const decorate = ([node, path]: NodeEntry<Node>) => {
    const ranges: Range[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    return markdownRanges(node.text).map(node => ({
      [node.type]: true,
      anchor: { path, offset: node.start },
      focus: { path, offset: node.end },
    }));
  }

  // Pull in current document from Redux
  const currentDocument = useSelector((state: TState) => state.currentDocument);
  const selectedDocument = useSelector((state: TState) => {
    const doc = state.documents.find(doc => doc.id === state.currentDocument)
    if (!doc) {
      throw new Error('shucks');
    }
    return doc;
  });

  const [value, setValue] = useState<TDocument>([
    {
      type: 'line',
      children: [{ text: 'should not be shown' }]
    }
  ]);

  useEffect(() => {
    setValue(selectedDocument.document);
  }, [currentDocument]);

  return (
    <>
      <Slate editor={editor} value={value} onChange={newValue => {
        // type boundary: we cast from Slate's internal types
        // to our internal types
        const x: any = newValue;

        setValue(x);
      }}>
        <div className="editor p2" ref={ref}>
          <Editable decorate={decorate} renderElement={RenderElement} renderLeaf={RenderLeaf} />
        </div>
      </Slate>
      <div className="doc">
        <pre>
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </>
  )
}