import { basicSetup } from "codemirror"
import { EditorView } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import * as mirrorConsole from "./lib/mirror-console"

const util = require('util');

const runCode = async function ( editor ) {
  const snippet    = editor.contentDOM.closest( ".inline-console" );
  const hinted     = snippet.querySelector( ".log-hint" );
  //const inst       = snippet.dataset.instance && answers[ snippet.dataset.instance ];
  const inst = false;
  const runContext = { console: consoleMock };
  try {
      const result = await editor.runInContext( runContext, {} );

      // There's a JSON entry associated with this snippet:
      if( inst ) {
          // This snippet has a correct result...
          const parsed = JSON.parse( inst.answer );

          if( ( inst.answer && ( inst.answer === result || util.inspect( parsed ) == util.inspect( result ) ) ) || ( inst.type && inst.type === typeof result ) ) {
              // ...and you got it.
              consoleMock.success( inst.success );

              snippet.classList.add( "right-answer" );
              snippet.addEventListener( "animationend", function( e ) {
                  this.classList.remove( "right-answer" );
              });
              return;
          } else {
              // ...and you did not get it.
              inst.chances > 0 && inst.chances--;

              snippet.classList.add( "wrong-answer" );
              snippet.addEventListener( "animationend", function( e ) { 
                  this.classList.remove( "wrong-answer" );
              });

              if( inst.chances === 0 && !hinted ) {
                  consoleMock.hint( inst.hint );
              }
          }
      }
      console.log( result );
      if( result !== undefined ) {
          printConsole( [result], "log-row log-return" );
      }
  } catch ( error ) {
      consoleMock.error( error );
  }
};



const consoleMock = {
  log: function () {
      printConsole( Array.prototype.slice.call( arguments ), "log-row log-normal");
      console.log.apply( console, arguments );
  },
  info: function () {
      printConsole( Array.prototype.slice.call( arguments ), "log-row log-info");
      console.info.apply( console, arguments );
  },
  warn: function () {
      printConsole( Array.prototype.slice.call( arguments ), "log-row log-warn");
      console.warn.apply( console, arguments );
  },
  error: function () {
      printConsole( Array.prototype.slice.call( arguments ), "log-row log-error");
      console.error.apply( console, arguments );
  },
  hint: function () {
      printConsole( Array.prototype.slice.call( arguments ), "log-row log-hint");
      console.info.apply( console, arguments );
  },
  success: function () {
      printConsole( Array.prototype.slice.call( arguments ), "log-row log-success");
      console.log.apply( console, arguments );
  }
};
function printConsole( args, className ) {
  const logArea = document.querySelector( "output" );
  const line = document.createElement( "pre" );
  const outputs = args.map(function (arg) {
      if ( ( String( arg ) === "[object Window]" || String( arg ) === "[object Object]" ) || Array.isArray( arg ) ) {
          return "Object " + util.inspect(arg, { showHidden: true, compact : false });
      }
      if( util.types.isBoxedPrimitive( arg ) ) {
        /* This sucks: */
        if( util.types.isBooleanObject( arg ) ) {
          return `Boolean { [[PrimitiveValue]] : ${ arg.toString() } }`;
        }
        if( util.types.isNumberObject( arg ) ) {
          return `Number { [[PrimitiveValue]]  : ${ arg.toString() } }`;
        }
        if( util.types.isStringObject( arg ) ) {
          return `String { [[PrimitiveValue]]  : ${ arg.toString() } }`;
        }
        if( util.types.isSymbolObject( arg ) ) {
          return `Symbol { [[PrimitiveValue]]  : ${ arg.toString() } }`;
        }
        if( util.types.isBigIntObject( arg ) ) {
          return `BigInt { [[PrimitiveValue]] : ${ arg.toString() } }`;
        }
      }
      return String( util.inspect( arg, { compact : false }) );
  });

  line.setAttribute( "class", className );
  line.appendChild( document.createTextNode( outputs.join(", ") ) );

  logArea.appendChild( line );
}

export default function() {
  const codeConsoles = document.querySelectorAll( ".inline-console" );
  const createConsole = ( currentConsole, editorView ) => {
    const output   = document.createElement( "output" );
    const controls = document.createElement( "div" );
    const runBtn   = document.createElement( "button" );
    const resetBtn = document.createElement( "button" );
    const clearBtn = document.createElement( "button" );

    controls.append( runBtn );

    controls.setAttribute( "role", "menubar" );

    controls.append( runBtn );
    controls.append( resetBtn );
    controls.append( clearBtn );

    runBtn.innerHTML = "Run";
    runBtn.setAttribute( "role", "menuitem" );

    runBtn.addEventListener( "click", function( e ) {
      runCode( editorView );
    });

    resetBtn.innerHTML = "Reset";
    resetBtn.setAttribute( "role", "menuitem" );

    resetBtn.addEventListener( "click", function( e ) {
      editorView.dispatch({
        changes: {
          from: 0, 
          to: editorView.state.doc.toString().length, 
          insert: currentConsole.dataset.originalState
        }
      })
    });

    clearBtn.innerHTML = "Clear";
    clearBtn.setAttribute( "role", "menuitem" );
    clearBtn.addEventListener( "click", function( e ) {
      editorView.dispatch({
        changes: {
          from: 0, 
          to: editorView.state.doc.toString().length, 
          insert: ""
        }
      })
    });

    const consoleLabel = document.createElement( "h3" );
    consoleLabel.innerHTML = "Editor:";

    currentConsole.insertBefore( consoleLabel, currentConsole.querySelector( "pre" ) );
    editorView.contentDOM.setAttribute( "aria-labelledby", "testing ");

    currentConsole.append( controls );

    const outputLabel = document.createElement( "h3" );
    outputLabel.innerHTML = "Console:";
    output.append( outputLabel )
    currentConsole.append( output );
  };
  const init = ( codeConsole ) => {
    const originalCode = codeConsole.querySelector( "pre" ).textContent.trim().toString();
    const language = new Compartment;

    codeConsole.dataset.originalState = originalCode;
    const view = new EditorView({
      doc: originalCode,
      parent: codeConsole,
      extensions: [ 
        basicSetup,
        language.of( javascript() )
      ]
    });

    view.runInContext = async function (context, options = {}) {
        if (this.runningEvalContext) {
            this.runningEvalContext.remove();
        }
        const jsCode = this.state.doc.toString();
        this.runningEvalContext = mirrorConsole.createContextEval();
        return this.runningEvalContext.run(jsCode, context, options);
    };

    createConsole( codeConsole, view );
  };
  codeConsoles.forEach( codeConsole => { 
    init( codeConsole );
    codeConsole.querySelector( "pre" ).remove();
  });

}