import React from 'react';
import { RenderLeafProps } from "slate-react";

export const RenderLeaf = (props: RenderLeafProps) => {
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