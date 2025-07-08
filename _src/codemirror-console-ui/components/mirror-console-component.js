"use strict";

require( "./mirror-console-component.css" );
require( "codemirror/lib/codemirror.css" );
require( "./themes/ayu-dark.css" );

const answers       = require( "./answers.js" );
const util          = require( "util" );
const newElement    = require( "./new-element" );
const MirrorConsole = require( "codemirror-console" );

let userContext = {};

function intendMirrorConsole( element, defaultsText, MirrorConsoleOptions = {} ) {
    const mirrorInstance = new MirrorConsole();
    const codeMirrorEditor = mirrorInstance.editor;
    const node = newElement( require( "./mirror-console-component.hbs" ) );
    const logArea = node.querySelector( "output" );
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
    const runCode = async function () {
        const snippet    = this.closest( ".inline-console" );
        const hinted     = snippet.querySelector( ".log-hint" );
        const inst       = snippet.dataset.instance && answers[ snippet.dataset.instance ];
        const runContext = { console: consoleMock, ...userContext };
        try {
            const result = await mirrorInstance.runInContext( runContext, MirrorConsoleOptions );
            
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
            if( result !== undefined ) {
                printConsole( [result], "log-row log-return" );
            }
        } catch ( error ) {
            consoleMock.error( error );
        }
    };

    function printConsole( args, className ) {
        const line = document.createElement( "span" );
        const outputs = args.map(function (arg) {
            if ( ( String( arg ) === "[object Window]" || String( arg ) === "[object Object]" ) || Array.isArray( arg ) ) {
                return util.inspect(arg);
            }
            if ( arg && arg.cause ) {
                return String(arg) + " (Caused by: " + String(arg.cause) + ")";
            }
            return String( arg );
        });

        line.setAttribute( "class", className );
        line.appendChild( document.createTextNode( outputs.join(", ") ) );

        logArea.appendChild( line );
    }


    /* Set up the editor */
    codeMirrorEditor.setOption( "lineNumbers", true );
    codeMirrorEditor.setOption( "theme", "ayu-dark" );
    codeMirrorEditor.setOption( "extraKeys", {
        "Ctrl-Enter": function () {
            runCode.call( mirrorInstance.textareaHolder );
        }
    });

    mirrorInstance.setText( defaultsText || "" );
    mirrorInstance.textareaHolder.classList.add( "console-wrapper" );
    mirrorInstance.swapWithElement( element );

    node.querySelector('[data-cmd="run"]').addEventListener("click", runCode );
    node.querySelector('[data-cmd="clear"]').addEventListener("click", function( e ) {
        this.closest( ".inline-console" ).querySelector("output").innerHTML = "";
    });
    node.querySelector( '[data-cmd="copy"]' ).addEventListener( "click", function( e ) {
        navigator.clipboard
          .writeText( codeMirrorEditor.getValue() )
          .then(
            console.log( "Copied." )
          );
    });
    node.querySelector( '[data-cmd="reset"]' ).addEventListener( "click", ( e ) => {
        codeMirrorEditor.setValue( defaultsText );
        console.clear();
    });

    mirrorInstance.textareaHolder.closest( ".inline-console" ).appendChild( node );

    return mirrorInstance;
}

function attachToElement( element, defaultsText, options = {} ) {
    const mirror = intendMirrorConsole(element, defaultsText, {
        type: options.type
    });
}

export { attachToElement };