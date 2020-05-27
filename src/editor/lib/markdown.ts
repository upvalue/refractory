// markdown.ts - limited markdown parser for slatejs decorations

export type MarkdownToken = {
  type: 'bold' | 'text' | 'italic';
  content: ReadonlyArray<MarkdownToken | string>;
  start: number;
  end: number;
}

export const parseMarkdownParagraph = (text: string, start: number) => {
  const stack: Array<MarkdownToken | string> = [];

  let textSlice = 0;

  const saveText = (i: number) => {
    if (text.slice(textSlice, i) !== '') {
      stack.push(text.slice(textSlice, i));
    }
  }

  // TODO: I actually don't even need to allocate multiple strings here, since I'm not
  // producing a tree, I just need the ranges.

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];

    // Possible italic open, consume to next *
    // TODO: Heck of code duplications
    if (c === '*') {
      if (i + 1 !== text.length && text[i + 1] === '*') {
        for (let j = i + 1; j < text.length; j += 1) {
          if (text[j] === '*') {
            if (j + 1 !== text.length && text[j + 1] === '*') {
              saveText(i);
              stack.push({
                type: 'bold',
                content: parseMarkdownParagraph(text.slice(i + 2, j), i + 2),
                start: start + i,
                end: start + j,
              });
              i = textSlice = j + 2;
              break;
            }
          }
        }
      } else {
        for (let j = i + 1; j < text.length; j += 1) {
          if (text[j] === '*') {
            saveText(i);
            stack.push({
              type: 'italic',
              content: parseMarkdownParagraph(text.slice(i + 1, j), i + 1),
              start: start + i,
              end: start + j + 1,
            });
            i = textSlice = j + 1;
            break;
          }
        }
      }
    }
  }

  saveText(text.length);

  return stack;
}

