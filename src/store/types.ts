// types.ts - Document types

/**
 * For simplicty's sake, we keep these separate from SlateJS types, since SlateJS has some
 * fairly generous type definitions (e.g. allowing [key: string]: unknown) and we can narrow
 * our types down and use them in and around the program.
 */

export type TText = {
  text: string;
};

export type TElement = {
  type: 'line' | 'heading';
  children: TNode[];
};

export type TNode = TText | TElement;

export type TDocument = TNode[];

/**
 * A document record; would be a toplevel database record containing an actual
 * document as well as information about it
 */
export type TDocumentRecord = {
  id: string;
  document: TDocument;
};
