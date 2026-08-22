DIGITAL ROMANCE v4 — corpus-enabled version

Files:
- index.html
- style.css
- script.js
- corpus-data.js

The Corpus Explorer now searches the six Xavier-related text files used in the study:
Main Story, Anecdote, Card Story, Text Messages, Whisper/Companionship, and Calls.

Search results are displayed as short keyword-in-context windows.
The complete corpus text is stored in corpus-data.js so the search works without a server-side database.

To update the corpus later:
1. Replace the corresponding text in corpus-data.js (or regenerate it from the source .txt files).
2. Keep layer names consistent with the dropdown options in index.html.
