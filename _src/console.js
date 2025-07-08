import { attachToElement } from "./codemirror-console-ui/dist/mirror-console-component" 

export default function() {
  const codeConsoles = document.querySelectorAll( ".inline-console code" );
  const init = ( codeConsole ) => {
    attachToElement( codeConsole, codeConsole.textContent.toString(), {
       state: "open",
       scrollIntoView: false
    });
  };
  codeConsoles.forEach( codeConsole => init( codeConsole ) );
};
