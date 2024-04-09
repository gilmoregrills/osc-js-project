# osc-js-project

running on rpi, but could run on a random box somewhere probably

## to-run

to start:
```
node index.js
```
and navigate to `http://rpi.local:8080`

run `orca` while SSH'd to rpi.local (or the random box) to interact, ensuring that orca is outputting to `0.0.0.0:57121`

## notes/gotchas

### orca-c osc message format

orca-c requires that you set the length of the orca messages, so messages must look like:
```
=<path><length><arg1><arg2>...<arg34>
```

### orca-c controls

```
┌ Controls ───────────────────────────────────────────┐
│           Ctrl+Q  Quit                              │
│       Arrow Keys  Move Cursor                       │
│     Ctrl+D or F1  Open Main Menu                    │
│   0-9, A-Z, a-z,  Insert Character                  │
│    ! : % / = # *                                    │
│         Spacebar  Play/Pause                        │
│ Ctrl+Z or Ctrl+U  Undo                              │
│           Ctrl+X  Cut                               │
│           Ctrl+C  Copy                              │
│           Ctrl+V  Paste                             │
│           Ctrl+S  Save                              │
│           Ctrl+F  Frame Step Forward                │
│           Ctrl+R  Reset Frame Number                │
│ Ctrl+I or Insert  Append/Overwrite Mode             │
│        ' (quote)  Rectangle Selection Mode          │
│ Shift+Arrow Keys  Adjust Rectangle Selection        │
│   Alt+Arrow Keys  Slide Selection                   │
│   ` (grave) or ~  Slide Selection Mode              │
│           Escape  Return to Normal Mode or Deselect │
│  ( ) _ + [ ] { }  Adjust Grid Size and Rulers       │
│          < and >  Adjust BPM                        │
│                ?  Controls (this message)           │
└─────────────────────────────────────────────────────┘
```
