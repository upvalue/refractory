import { configureStore, createSlice } from '@reduxjs/toolkit';

import logger from 'redux-logger';

import short from 'short-uuid';
import { TDocument } from './types';

const translator = short();

const generateId = (tipe: string) => {
  return `${tipe}-${translator.new()}`;
}

const initialDocument = {
  id: generateId('doc'),
  document: [{
    type: 'line',
    children: [{ text: 'click to edit' }]
  }]
};

const initialCollection = {
  id: generateId('collection'),
};

const docs = createSlice({
  name: "docs",
  initialState: {
    documents: [initialDocument],
    currentDocument: initialDocument.id,
    collections: {
      [initialCollection.id]: initialCollection,
    }
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