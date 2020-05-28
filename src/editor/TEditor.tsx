import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react'
import { NodeEntry, Node, Range, Text } from 'slate';

import { makeEditor } from './lib/editor';
import { markdownRanges } from './lib/markdown';
import { TDocument, TState, TDocumentRecord } from '../store/types';
import { useSelector } from 'react-redux';
import { RenderLeaf } from './RenderLeaf';
import { RenderElement } from './RenderElement';
import { useRouteMatch } from 'react-router';

export type Props = {
  document: TDocumentRecord;
}

type RouteParams = {
  documentId: string;
};

/**
 * Editor with custom extensions
 */
export const TEditor = (props: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedDocument = props.document;
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

  const [value, setValue] = useState<TDocument>([
    {
      type: 'line',
      children: [{ text: 'should not be shown' }]
    }
  ]);

  useEffect(() => {
    setValue(selectedDocument.document);
  }, [selectedDocument.id]);

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