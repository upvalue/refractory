// BUG: If you create a list with some existing text, the cursor begins at the beginning rather than the end
// On Chrome, not Firefox

// BUG: Introduce rich formatting to a code block, then try to turn it into a code block
// It doesn't work because we only go off of text nodes

// BUG: Occasionally the header transformation breaks

// TODO: hr
// TODO: links
// TODO: blockquote

// extended

// TODO: saving/loading sanitized
// TODO: code
// TODO: Table of contents
// TODO: Tables
// TODO: Hashtags
// TODO: cursor-based popup editor
// TODO: extensible slash-commands (?)

// For normal editing, we require some kind of breaking
// character (whitespace, comma) to disambiguate
const normalRegexen = [
  [/__(.+?)__([\s,])/g, '<strong>$1</strong>$2'],
  // TODO how does the comma work? are there stop punctuation letters?o
  [/_(.+?)_[\s,]/g, '<em>$1</em>&nbsp;'],
  // [/`(.+?)`/g, '<span class="rf-inline-code">$1</span>&#8203;']
]

// TODO: Backspacing into code should detransform the output

// For EOL we don't require subsequent whitespace, in order to handle things at the
// the end of the line 
const eolRegexen = [
  [/__(.+?)__/g, '<strong>$1</strong>'],
  [/_(.+?)_/g, '<em>$1</em>'],
]

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

/**
 * Remove contenteditable state e.g. bold
 * @param {*} name 
 */
const disableCommandState = (name) => {
  if (document.queryCommandState(name) === true) {
    document.execCommand(name);
  }
}

const disableCommandStates = (...names) =>
  names.forEach(disableCommandState);

/**
 * Return the actively edited element
 */
const getActiveElement = () => {
  const node = document.getSelection().anchorNode;
  return (node.nodeType === 3 ? node.parentNode : node);
}

/*
 * Return the last node in a node tree, if it is text, regardless of depth
 */
const lastNodeIfText = (node) => {
  let i = node;
  console.log(node);
  while (i.nodeType !== Node.TEXT_NODE) {
    if (i.childNodes.length > 0) {
      i = i.childNodes[i.childNodes.length - 1];
      continue;
    }
    return null;
  }
  return i;
}

/**
 * Given some arbitrary text determine what kind of transformation, if any
 * should be done to it, e.g. __hello__ becomes <strong>hello</strong>
 * 
 * This function returning a transformation doesn't guarantee that it will happen
 * e.g. we don't allow headers and lists anywhere except toplevel
 * @param {*} str 
 * @param {*} regexen 
 * @returns a tuple describing what should occur
 */
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
      return ['header', headerSize];
    }
  } else if (formatChar.startsWith('*')) {
    return ['list', 'ordered'];
  }

  // Look at this I mean can you believe I did this?
  // It's truly awful
  return ['sub', regexen.reduce((a, b) => a.replace(b[0], b[1]), str)];
}

export default class Editor {
  state = {
    /**
     * True when inserting a markdown list
     */

    insertingMarkdownList: false,
    /**
     * Used to avoid redundant observer dispatches
     */
    disableObserver: false,
  };

  processLastTextNode(node) {
    if (!node) return; // This can happen if all text is deleted
    if (node.nodeType === Node.TEXT_NODE) {
      this.processTextNode(node, eolRegexen);
    } else {
      if (node.childNodes.length === 0) return;
      this.processLastTextNode(node.childNodes[node.childNodes.length - 1]);
    }
  }

  processTextNode(textNode, regexen = normalRegexen) {
    let parent = textNode.parentElement;
    if (!parent) return;
    const [type, result] = transformText(textNode.wholeText, regexen);

    // Sub is the default return, but it doesn't mean anything actually changed, so check
    // if it did before continuing
    if (type === 'sub' && result !== textNode.wholeText) {
      // TODO: Probably so small as to be pointless, but maybe we should reuse the same span for
      // each of these operations
      // Use a temporary element to convert this to real DOM nodes
      const tmp = document.createElement('span');

      // Insert the dom nodes before that text
      tmp.innerHTML = result;

      while (tmp.childNodes.length) {
        parent.insertBefore(tmp.childNodes[0], textNode);
      }
      parent.removeChild(textNode);
    } else if (type === 'header') {
      // Refuse to create a header at non-toplevel
      if (!parent.classList.contains("rf-editor-line")) return;

      // Create a header node
      const hnode = document.createElement(`h${result}`);

      // Insert a zero-width space and put the user's cursor after it
      hnode.innerHTML = '&#8203;';

      parent.insertBefore(hnode, textNode);
      parent.removeChild(textNode);

      moveCursor(hnode, 1);
    } else if (type === 'list') {
      this.state.insertingMarkdownList = true;
      if (nodeIsOrHasAncestorOfNames(parent, 'UL')) {
        return;
      }
      document.execCommand('insertUnorderedList');
    }
  }

  mount(editor) {
    editor.classList.add('rf-editor');

    editor.addEventListener('keydown', e => {
      if (e.isComposing || e.keyCode === 229) return;

      // Trap tabs
      if (e.keyCode === 9) {
        e.preventDefault();
        const activeElt = getActiveElement();

        // Refuse to make a header into a list
        if (nodeIsOrHasAncestorOfNames(activeElt, ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])) return;

        // normal insertUnorderedList will actually remove the list if there is one
        // but indent will nest properly, like we want
        const command = nodeIsOrHasAncestorOfNames(activeElt, 'LI') ? 'indent' : 'insertUnorderedList';

        document.execCommand(command, false, null);
      }
    })

    const observer = new MutationObserver((mutations, observer) => {
      for (const mutation of mutations) {
        if (this.state.disableObserver) {
          this.state.disableObserver = false;
          return;
        }

        // console.log('MutationObserver', mutation);
        if (mutation.type === 'characterData') {
          this.processTextNode(mutation.target);
        } else if (mutation.type === 'childList') {
          // TBD: Handle formatting at the end of lists!

          // Try to process the end of the last line, if the user has created a new one
          if (mutation.target === editor && mutation.addedNodes.length === 1) {
            const prevNode = mutation.addedNodes[0].previousSibling;
            this.processLastTextNode(prevNode);
          } else if (mutation.addedNodes.length === 1) {
            const node = mutation.addedNodes[0];

            // If true, we've just done an execCommand to create a list, and now we need to 
            // remove the text content
            if (this.state.insertingMarkdownList && node.nodeName === 'UL') {
              this.state.insertingMarkdownList = false;
              const li = node.childNodes[0];
              li.innerHTML = '';
            } else if (this.state.insertingMarkdownList && node.nodeName === 'LI') {
              // It's possible for an LI to be inserted as a list, because
              // execCommand insertXList at the end of a list splices the LI
              // back onto the list
              this.state.insertingMarkdownList = false;
              node.innerHTML = '';
            } else if (node.nodeName === 'LI' && node.previousSibling) {
              // Detect when an LI has been added to a list in order to fully process
              // the text nodes of the last LI
              const lastTextNode = lastNodeIfText(node.previousSibling);
              if (lastTextNode) {
                this.processLastTextNode(lastTextNode);
              }
            } else if (node.nodeName === 'DIV' && node.parentElement !== editor) {
              // Detect if a single div has been inserted, at non-toplevel
              // If it has, splice it up to a toplevel .rf-editor-line
              const parent = node.parentElement;
              node.parentElement.removeChild(node);
              parent.parentElement.insertBefore(node, parent.nextSibling);
              node.classList.add('rf-editor-line');
              // Move cursor to new node
              moveCursor(node, 0);
              return;

              // Remove any formatting that is present
            }
          }

          // If user backspaces into a backtick inline code box, detransform it
          if (mutation.removedNodes.length === 1) {
            const node = mutation.removedNodes[0];
            if (node.nodeType === Node.TEXT_NODE && node.wholeText === '' && mutation.previousSibling && mutation.previousSibling.classList.contains('rf-inline-code')) {
              const codeSpan = mutation.previousSibling;
              const detransformed = document.createTextNode(`\`${codeSpan.innerHTML}`);
              codeSpan.parentElement.insertBefore(detransformed, codeSpan);
              codeSpan.parentElement.removeChild(codeSpan);
            }
          }

          // Also, if user spaces out of a code bo

          // Don't carry over formatting to new lines
          if (mutation.target === editor && mutation.addedNodes.length === 1 && mutation.addedNodes[0].classList.contains('rf-editor-line')) {
            disableCommandStates('bold', 'italic', 'underline', 'strikethrough');
          }
        }
      }
    });

    observer.observe(editor, {
      attributes: true, childList: true, subtree: true, characterData: true
    });
  };
}