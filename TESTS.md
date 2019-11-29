# Tests

Because contenteditable behavior is heavily browser based, traditional tests are useless. Headless
Chrome based tests may be valuable but this project is in such flux that it does not make sense
to commit to a test suite yet.

The following is a set of manual tests in the form of keystrokes.

## Blockquotes

### Can exit from an empty blockquote

> h{backspace}{enter}

### Can exit from a basic blockquote

> h{enter}
> {enter}

### Can exit from a multiline blockquote

> h{enter}
> j{enter}
> {enter}

### Can exit from the middle of a multiline blockquote

> h{enter}
> j{enter}{up-arrow}{right-arrow}{enter}{enter}
