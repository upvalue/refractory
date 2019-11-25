// BUG: If you create a list with some existing text, the cursor begins at the beginning rather than the end
// On Chrome, not Firefox

// BUG: You can delete all the .rf-editor-line divs, which then breaks our assumptions
// about how the data is structured. Don't allow the user to completely remove everything

// for normal editing, we require some kind of breaking
// character (whitespace, comma) to disambiguate
const normalRegexen = [
  [/__(.+?)__([\s,])/g, '<strong>$1</strong>$2'],
  // TODO how does the comma work? are there stop punctuation letters?o
  [/_(.+?)_[\s,]/g, '<em>$1</em>&nbsp;'],
]

// for EOL we don't require following chars to handle things at the end of the line
const eolRegexen = [
  [/__(.+?)__/g, '<strong>$1</strong>'],
  [/_(.+?)_/g, '<em>$1</em>'],
]

let state = {
  insertingMarkdownList: false,
};

/**
 * Move a cursor to a particular location within a node
 * Used when splicing DOM nodes
 * @param {*} node 
 * @param {*} start 
 */
const moveCursor = (node, start = 0) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(node, start);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

const transformText = (str, regexen) => {
  // Certain things are only processed when they are the first non-whitespace
  // character in the first four characters of a string

  // Headers & lists
  const formatChar = str.slice(0, 4).trimLeft();

  if (formatChar.startsWith('#')) {
    let newStr = str.trimLeft()
    let headerSize = 0;
    // check for consecutive #'s to determine header size, check that there is a whitespace
    // char following the # to indicate desire to header-ify
    let i;
    for (i = 0; i !== newStr.length; i += 1) {
      if (newStr[i] === '#') {
        headerSize += 1;
        if (headerSize === 6) break;
      } else {
        i -= 1;
        break;
      }
    }

    // We have to use \s here instead of just checking for a space
    // because different browsers use different whitespacing strategies ;_;
    if (newStr.length > (i + 1) && /\s/.test(newStr[i + 1])) {
      return ['header', headerSize, newStr.slice(i + 1).trimLeft()];
    }
  } else if (formatChar.startsWith('*')) {
    return ['list', 'ordered'];
  }

  // Look at this I mean can you believe I did this?
  return ['sub', regexen.reduce((a, b) => a.replace(b[0], b[1]), str)];
}


const processTextNode = (textNode, regexen = normalRegexen) => {
  let parent = textNode.parentElement;
  if (!parent) return;
  const [type, result] = transformText(textNode.wholeText, regexen);

  if (type === 'sub' && result !== textNode.wholeText) {
    // markdown formatting occurred, sub in new stuff

    // TODO: This creates garbage spans in the output. Is it possible to 
    // sub in HTML to the parent element at the caret?
    const elt = document.createElement('span');
    elt.classList.add('rf-fmt-span');
    elt.innerHTML = result;
    parent.insertBefore(elt, textNode);
    parent.removeChild(textNode);
  } else if (type === 'header') {
    // Refuse to create a header at non-toplevel
    if (!parent.classList.contains("rf-editor-line") && !parent.classList.contains('rf-fmt-span')) return;

    const hnode = document.createElement(`h${result}`);

    // Insert a zero-width space and put the user's cursor after it
    hnode.innerHTML = '&#8203;';

    // if this is a toplevel rf-fmt-span
    if (parent.classList.contains('rf-fmt-span')) {
      const fmtSpan = parent;
      if (fmtSpan.parentElement.classList.contains('rf-editor-line')) {
        parent = fmtSpan.parentElement;
        parent.removeChild(fmtSpan);
      }
    }

    parent.insertBefore(hnode, textNode);
    parent.removeChild(textNode);

    moveCursor(hnode, 1);
  } else if (type === 'list') {
    state.insertingMarkdownList = true;
    if (nodeIsOrHasAncestorOfNames(parent, 'UL')) {
      return;
    }
    document.execCommand('insertUnorderedList');
  }
}

const processLastTextNode = (node) => {
  if (!node) return; // This can happen if all text is deleted
  if (node.nodeType === Node.TEXT_NODE) {
    processTextNode(node, eolRegexen);
  } else {
    if (node.childNodes.length === 0) return;
    processLastTextNode(node.childNodes[node.childNodes.length - 1]);
  }
}

const getActiveElement = () => {
  const node = document.getSelection().anchorNode;
  return (node.nodeType === 3 ? node.parentNode : node);
}

/**
 * Check if a node is or has an ancestor with a particular nodeName (DIV, LI, etc)
 * @param {*} node 
 * @param {*} nodeNames Can be a string or an array of strings
 */
const nodeIsOrHasAncestorOfNames = (node, nodeNames) => {
  if (typeof nodeNames === 'string') nodeNames = [nodeNames];

  let next = node;
  while (!next.classList.contains('rf-editor')) {
    if (nodeNames.includes(next.nodeName)) return true;
    next = next.parentNode;
  }
  return false;
}

export default class Editor {
  mount(editor) {
    editor.classList.add('rf-editor');

    editor.addEventListener('keydown', e => {
      if (e.isComposing || e.keyCode === 229) return;
      // Trap tabs
      if (e.keyCode === 9) {
        e.preventDefault();
        const activeElt = getActiveElement();

        // TODO: Refuse to do this within a header
        if (nodeIsOrHasAncestorOfNames(activeElt, ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])) return;

        // normal insertUnorderedList will actually remove the list if there is one
        // but indent will nest properly, like we want
        const command = nodeIsOrHasAncestorOfNames(activeElt, 'LI') ? 'indent' : 'insertUnorderedList';

        document.execCommand(command, false, null);
      }
    })

    const observer = new MutationObserver((mutations, observer) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          processTextNode(mutation.target);
        } else if (mutation.type === 'childList') {
          // TBD: Handle formatting at the end of lists!
          // Try to process the end of the last line, if the user has created a new one
          if (mutation.target === editor && mutation.addedNodes.length === 1) {
            const prevNode = mutation.addedNodes[0].previousSibling;
            processLastTextNode(prevNode);
          } else if (mutation.addedNodes.length === 1) {
            const node = mutation.addedNodes[0];

            // If true, we've just done an execCommand to create a list 
            if (state.insertingMarkdownList && node.nodeName === 'UL') {
              state.insertingMarkdownList = false;
              const li = node.childNodes[0];

              console.log('removing this:', li.innerHTML);
              li.innerHTML = '';
            } else if (state.insertingMarkdownList && node.nodeName === 'LI') {
              // It's possible for an LI to be inserted as a list, because
              // execCommand insertXList at the end of a list splices the LI
              // back onto the list
              state.insertingMarkdownList = false;
              console.log('removing this:', node.innerHTML);
              node.innerHTML = '';
            }

            // Detect if a single div has been inserted, at non-toplevel
            // If it has, splice it up to a toplevel .rf-editor-line
            if (node.nodeName === 'DIV' && node.parentElement !== editor) {
              node.parentElement.removeChild(node);
              node.classList.add('rf-editor-line');
              editor.appendChild(node);
              // Move cursor to new node
              const range = document.createRange();
              range.setStart(node, 0);
              range.collapse(true);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }
      }
    });

    observer.observe(editor, {
      attributes: true, childList: true, subtree: true, characterData: true
    });
  };
}