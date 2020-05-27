import { configureStore, createSlice } from '@reduxjs/toolkit';

import logger from 'redux-logger';

import short from 'short-uuid';

const translator = short();

const generateId = (tipe: string) => {
  return `${tipe}-${translator.new()}`;
}

const initialDocument = {
  id: generateId('doc'),
  document: {
    type: 'paragraph',
    children: [{ text: 'click to edit' }]
  }
};


const docs = createSlice({
  name: "docs",
  initialState: {
    documents: [initialDocument],
    currentDocument: initialDocument.id,
  },
  reducers: {
  },
});

export const store = configureStore({
  reducer: docs.reducer,
  middleware: [
    logger,
  ],
})