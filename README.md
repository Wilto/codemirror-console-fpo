Alright. This is torn torn out of my janky old Eleventy-based writing site; it _technically_ works, but not by much.

To get the whole thing running, `npm i`, then `npm run js`, then `npm start`.

To rebuild the mirror console script _itself_, go into `_src/codemirror-console-ui`, `npm i`, and `npm run build` or (`npm run watch`, for tinkering purposes). Make sure to re-run `npm run js` at the Eleventy level.

Here's how I _envision_ this thing working:
I want a standard `pre`/`code` scenario that enhances up to one of these embedded components. As seen in this janky prototype, there are a couple things it needs: 
* A "run" button that does actually run the code, and outputs the results of any expression in the embedded console, devtools-style ("Run Code" in the prototype).
* A "reset to how it was before I messed with it" button ("Reset Editor" in the prototype).
* A method of clearing the console.

If you take a look at `answers.js`, I was experimenting with a way of associating an embedded console with an object containing some validation stuff:

```jsx
module.exports = {
    first: {
        answer: '"test"',
        success: "You got the right answer.",
        chances: 3,
        hint: "You got this wrong N times, so here's a hint.",
    }
};
```

_This_ is how I see the course "exercises" playing out, rather than a "WHICH ONE OF THESE THREE THINGS IS A STRING" at the end. There's an _expected_ result, I just told you the best way to get there, so give it a shot and hit the run button. All ephemeral, no reloading pages, no slogging through local dev environments; try stuff out, break it, whatever, hit the reset button and try again. Meantime, you'll notice the "hint" there—maybe there's a ghost in the machine to give you a little nudge if you whiff it `chances` times?

This is using janky old CodeMirror 5, which I haven't tested personally, but understand to be pretty lousy accessibility-wise—that's an obvious non-starter. But flubbing the console seems like something I'll be able to do there too (check out `intendMirrorConsole` on L#14 of codemirror-console-ui/components/mirror-console-component.js).

CodeMirror can also do a lot more than this, as seen on CodePen: line highlighting, inline error messaging, etc.