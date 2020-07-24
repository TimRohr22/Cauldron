# InsertArg
Replacement script with custom hooks, ad hoc processing, and selective output. In other words: read this; do that; put it there.
## API Handles
!insertarg
!insertargs
!xray
## Command Line Breakdown
A command line is processed as the API handle, the first parameter (currently labeled as `abil`), and then all other subsequent parameters. Each of these provide insertion points for internal functions or processing.
### Delimiters
First level parameters are denoted by `/\s+--/`, and are split as `key#value`:

    !insertarg --abil#value --hook1#value1

Second level parameters are contained within parentheses for internal function calls, and are denoted by `!!`, and split as `key#value`:

    !insertarg --abil#value --hook1#internalFunction(!!param1#value1 !!param2)
If only for consistency, internal splits to value should be handled via `|`:

    !insertarg --abil#value --hook#val1|val2|val3|val4
### API Insertions
The most hackish of the insertion methods, since it requires editing the main `handleInput` function (test for the API handle, designate a value for apicatch, and branch the code on `if(apicatch===newApiHandle)...`). This is what the `xray` handle does. Not advised.
### Abil Insertions
The abil key/value pair is (or will be) tested for certain keys as directions of output (chat, load, button, menu, etc.), but also for certain short-circuits to particular functionality. For instance, the `handout` key feeds its value into the `processHandout` function. These redirections to internal functions are detected by testing the `abilFuncs` object for the presence of our key:

    abilFuncs = {
    	handout: processHandout
    };
(This redirect is not currently hooked into the `handleInput` function... It's what I'm working on.)
Further internal functions (to the `abil` parameter) should be handled utilizing destructuring assignment (visible in the `processHandout` function, but also detailed per its use in the section **Internal Function Insertions**, below).
Every function receiving a redirect from the `abil` parameter should return an object of three properties:

    retObj = {
    	ret: "",      		// any text to return
    	safe: true,   		// whether it is safe to chat
    	suspend: true 		// whether to suspend further argument processing
    }

### Internal Function Insertions
Any parameters passed after the first (`abil`) are first tested against our known parameters. These do not represent hooks into which we will drop our output, but any internal configuration the user needs to pass. They are detailed in the `cfgObj` object:

    cfgObj = {
	    table: menutable
	    row: menurow,
	    bg: bgcolor,
	    css: ""
    };
The properties for `table` and `row` are not evaluated at this point (that is, this is not how a user would input this information, via parameter).
The script then processes each of the "unknown" parameters (not present in `cfgObj`), testing them for a call to internal functions we have exposed. The available internal functions are mapped in the `availFuncs` object:

    const availFuncs = {
        gettargets: gettargets,
        targetsel: targetsel,
        getrepeating: getrepeating
    };

These functions are called by constructing the remaining parameters into an object that can be used with object destructuring on the receiving end:

        args.filter((a) => { return !Object.keys(cfgObj).includes(a[0].toLowerCase()); })           // deal with only the custom hooks (not part of cfgObj)
            .map((a) => {
                m = funcregex.exec(a[1]);
                if (m) {                                                                            // if we find a function
                    rep = availFuncs[m[1]]({                                                        // pass object to use with destructuring assignment on the receiving end
                        ...(Object.fromEntries((m[2] || "").split("!!")                             // this turns anything provided with a !! prefix into an available parameter for the receiving function
                            .filter((p) => { return p !== ""; })
                            .map(splitArgs)
                            .map(joinVals))),
                        theSpeaker: theSpeaker,
                        m: msg_orig,
                        cfgObj: cfgObj,
                    });
                } else {
                    rep = { ret: a[1], safe: true };                                                // if no internal function was designated, treat as flat text
                }
                safechat = !rep.safe ? false : safechat;                                            // trip safechat if necessary
                cmdline = cmdline.replace(new RegExp(escapeRegExp(a[0]), 'g'), rep.ret);            // replace all instances of the hook with the replacement text
                return;
            });
Each internal function handled in this way should return an object in the form of:

    retObj = {
    	ret: ""				// return text
    	safe: true			// whether we are safe to send this message to chat
    };
## Destructuring Elegance
By coding the internal functions to use destructuring assignment and constructing the call to each internal function using object notation, we expose immediate `!!` designation for any argument a new function would require, meaning we don't have to touch the `handleInput` function again. The receiving internal function (or abil receiving function) only needs to ask for the argument to make it available for the user.

    const someFunc = ({ arg1: a1="",
					    arg2: a2 = true
					  } = {}) => {
					  // stuff happens
	};
Allows for a call like:

    !insertarg --abil#value --hook#someFunc(!!arg1#value1 !!arg2#value2)
## Read From Here
Character Sheet - repeating elements, non-repeating attributes, abilities, bio, macros (?)
Handouts
## Do This
As above.
## Output As
Chat
Loaded Ability (InsertArg, or other)
Button
Menu
Query (optional query name vs just list)
Nested Query (optional query name vs just nested list)
Delimited List
Handout (section? hook?)

> Written with [StackEdit](https://stackedit.io/).







