/*  parseMoves
Parameters: string s
    - [piece 1][piece 2][...moves]
    - ex: XOAABBCC
Return: Array of objects representing the moves encoded in string s
 */
function parseMoves(s) {
    const splitString = [...s];
    const splitStringEntries = [...(splitString.slice(2)).entries()];
    return splitStringEntries.map( i => ( {val: splitString[i[0] % 2 ], col: i[1]}));
}

/*  shortestString
Parameters: s1, s2, s3, ..., sn

Return: Returns the shortest string of the args passed in
    - Returns undefined if nothing passed in.
 */
function shortestString(...s) {
    const smolbois = (smol, currentValue) => smol.length < currentValue.length ? smol : currentValue;
    const parameters = [...s];
    if (parameters.length === 0) {
        return undefined;
    }
    return parameters.reduce(smolbois);
}

/*  repeatCall
Parameters: fn, n, arg
    - fn is the function to be called repeatedly
    - n is the number of times to call the function
    - arg is argument to pass to the fucntion when called
Return: undefined. No return value
 */
function repeatCall(fn, n, arg) {
    if (n > 0) {
        fn(arg);
        repeatCall(fn, n - 1, arg);
    }
}

/*  repeatCallAllArgs
parameters: fn, n, args1 ... argsn
    - fn and n have the same role as in repeatCall()
    - args1 - argsn are all of the arguments to pass into the function fn when called

Return: no return value
 */
function repeatCallAllArgs(fn, n, ...args) {
    if (n > 0) {
        fn(...args);
        repeatCallAllArgs(fn, n - 1, ...args);
    }
}

/*  steppedForEach
Parameters: arr, fn, n
    - arr is the array containing potential arguments to the function fn
    - fn is the function to be called repeatedly
    - n is the number of elementes to be consumed from the array to be used as arguments to fn
Return: no return value
 */
function steppedForEach(arr, fn, step) {
    if (arr.length > step) {
        fn(...arr.slice(0, step));
        steppedForEach(arr.slice(step), fn, step);
    }
    else {
        fn(...arr);
    }
}

/*  constrainDecorator
Parameters: fn, min, max
    - fn is the function modify (decorate)
    - min is the min value that fn can return
    - max is the max value that fn can return

Return: Function that does the same thing as the original function, which returns only values in the range
specified by the min and max parameters
 */
function constrainDecorator(fn, min, max) {
    return function (...args) {
        const potentialReturn = fn(...args);
        if (min === null || max === null || min === undefined || max === undefined) {
            return potentialReturn;
        }

        return (potentialReturn > min && potentialReturn < max) ? potentialReturn : (potentialReturn > min ? max : min);
    };
}

/*  limitCallsDecorator
parameters: fn, n
    - fn is the function to be modified
    - n is the number of times that fn is allowed to be called

return: a function that does the same thing as fn, but it can only be called n times. After that, the
        return value will always be undefined
 */
function limitCallsDecorator(fn, n) {
    return function(...args) {
        if (n > 0) {
            n -= 1;
            return fn(...args);
        }
    };
}

/*  bundleArgs
parameters: fn, args1, args2 to argsn
    - fn is the function to get args bundled with it
    - args1, args2 to argsn any number of args that will automatically get filled in when the output function is used
 return: a version of fn that will take any number of parameters, but prefills the first n parameters with the arg originally passed in

 */
function bundleArgs(fn, ...args) {
    return function(...otherArgs) {
        return fn(...args, ...otherArgs);
    };
}

/*   sequence
parameters: fn1, fn2, to fnN

return: a function that will pass it's args to fn1, use that output for fn2 and so on.
 */
function sequence(...fns) {
    return function(...args) {
        return fns.reduce((prev, curr) => curr(prev), args);
    };
}


module.exports =
    {
        parseMoves: parseMoves,
        shortestString : shortestString,
        repeatCall: repeatCall,
        repeatCallAllArgs: repeatCallAllArgs,
        steppedForEach: steppedForEach,
        constrainDecorator: constrainDecorator,
        limitCallsDecorator: limitCallsDecorator,
        bundleArgs: bundleArgs,
        sequence: sequence,

    };
