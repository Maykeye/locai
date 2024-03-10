# locai README

## Features

Extension MUST BE MANUALLY ACTIVATED BEFORE IT WILL WORK.

Can connect via http to locally running API and query it.

Will not trigger until manually queried. 
Define `editor.action.inlineSuggest.trigger` in keyboard shortcuts.

Result can be trimmed line by line and for first line word by word.
Use alt-[ alt-] to loop 

Press TAB to insert 


(TODO
> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.
)

## Requirements

Oobabooga or other OpenAI compatible local tool must be running and open on 5000 port

## Extension Settings

DISABLED FOR NOW

## Known Issues

Not tested with anything but ooba

## Release Notes

### 0.0.3

* Added support for local server on 13333 that takes whole text, position and produces the text from there (locai-server on my github)
* Migrated API to Ooba OAI compatibility layer.
* ws replaced by axios.
* 99% of the code is rewritten from scratch
* Now Extension MUST BE MANUALLY ACTIVATED BEFORE IT WILL WORK.
* Extension must be triggereed manually using `editor.action.inlineSuggest.trigger` (I remapped Ctrl+\ taking it away from splitting)

### 0.0.1

Initial release
