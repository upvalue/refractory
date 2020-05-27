import React, { useRef, useMemo, useState } from 'react';

import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react'
import { NodeEntry, Node, Range, Text } from 'slate';

import { makeEditor } from './lib/editor';
import { parseMarkdownParagraph, MarkdownToken } from './lib/markdown';
import { TDocument, TElement } from '../store/types';

export type Props = {
}

/**
 * Editor with custom extensions
 */
export const TEditor = (props: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const editor = useMemo(() => withReact(makeEditor()), [])

  const renderElement = (args: any) => {
    const { attributes, children } = args;
    const element: TElement = args.element;

    switch (element.type) {
      case 'heading':
        return <h1 {...attributes}>{children}</h1>
      default:
        return <div {...attributes}>{children}</div>
    }
  }

  const renderLeaf = (props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;

    if (leaf.italic) {
      return (
        <em
          {...attributes}
        >
          {children}
        </em>
      )
    } else if (leaf.bold) {
      return (
        <strong
          {...attributes}
        >
          {children}
        </strong>

      )
    }

    return (
      <span
        {...attributes}
      >
        {children}
      </span>
    )
  }

  const decorate = ([node, path]: NodeEntry<Node>) => {
    const ranges: Range[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const buildRanges = (tokens: ReadonlyArray<MarkdownToken | string>) => {
      for (const token of tokens) {
        if (typeof token === 'string') {
          continue;
        }

        ranges.push({
          [token.type]: true,
          anchor: { path, offset: token.start },
          focus: { path, offset: token.end },
        });

        buildRanges(token.content);
      }
    }

    const tokens = parseMarkdownParagraph(node.text, 0);

    buildRanges(tokens);

    return ranges;
  }

  const [value, setValue] = useState<TDocument>([
    {
      type: 'line',
      children: [{ text: 'woot' }]
    }
  ])
  return (
    <>
      <Slate editor={editor} value={value} onChange={newValue => {
        // type boundary: we cast from Slate's internal types
        // to our internal types
        setValue(newValue as any as TDocument);
      }}>
        <div className="editor p2" ref={ref}>
          <Editable decorate={decorate} renderElement={renderElement} renderLeaf={renderLeaf} />
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