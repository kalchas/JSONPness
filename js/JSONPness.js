/*!
 * JSONPness client library.
 * Use at your own risk.
 * Please see the documentation for licensing, more information, and anything
 * else you think should normally appear here.
 */
/**
 * @fileoverview JavaScript client library for the JSONPness proxy.
 *
 * There are times when rapid development is more desirable than focusing on
 * a complete frontend/backend solution. Anyone who doesn't deal with security
 * for important applications should be shot, so we assume if you are using
 * this code you are someone who shouldn't be shot.
 *
 * JSONPness is a small bit of JavaScript + PHP code designed for one purpose:
 * to get around the web browser domain of origin policy. This code will give
 * you the ability to easily make cross-domain HTTP GET and POST requests. It
 * implements the JSONP concept (see http://en.wikipedia.org/wiki/JSONP#JSONP
 * and http://bob.pythonmac.org/archives/2005/12/05/remote-json-jsonp) in a
 * domain agnostic way.
 *
 * Notes only developers will care about:
 *
 * We use spaces, not tabs, for identation. Look to the code for guidance.
 *
 * We use *nix ('\n') line endings for development and code check in.
 *
 * This code will always be verbosely documented and we will always make the
 * development source code available.
 *
 * Auto-doc comments assume usage of jsdoc-toolkit version 2.3+.
 * We assume that the '-a' flag is not used when generating documentation.
 * For reference, jsdoc-toolkit project currently exists at:
 * (http://code.google.com/p/jsdoc-toolkit).
 *
 * We take advantage of the fact that JavaScript functions can always be named,
 * as long as the name is unique within the global scope. We use this for our
 * own stack tracing, as well as generating custom stack traces on older
 * browsers. These "namespace$methodName$" names are stripped out in production
 * versions of code.
 *
 * We use the YUI Compressor to minify our production code. The initial comment
 * in this file is designed to survive the YUI Compressor process, the rest of
 * the comments are not. For reference, the YUI Compressor currently exists at:
 * (http://developer.yahoo.com/yui/compressor/).
 *
 * We use, and include, the Apache Ant build script and custom tasks that
 * we use to build our code. You will need Apache Ant version 1.7, and will
 * most likely need Java SDK 1.6+ due to the way the custom ant tasks were
 * compiled. Apache Ant currently lives at:
 * (http://ant.apache.org/).
 *
 * @author Jeremy Osborne (responsible for JavaScript code),
 * me at jeremyosborne dot com
 * @author James Lafferty (responsible for PHP code),
 * james at nearlysensical dot com
 * @version development
 */

/*
 * Use local-global pattern.
 * Local-global, auto-execute pattern can cause performance problems on
 * mobile browsers, but the minimal size of this file when minified should
 * mitigate that problem.
 */
(function() {

/*
 * Quick exit to prevent multiple, and by nature incorrect, loads.
 * Refactor later to deal with configurable namespaces, etc.
 */
if ( window.JSONPness ) {
    return;
}

//---------------------------------------------------- General Local-Globals

/*
 * Local-global reference of standard global vars.
 * Used to improve file minification.
 */
var d = document,
    w = window;

//---------------------------------------------------- Namespace

/**
 * @namespace The JSONPness global, static object. The methods and properties
 * associated with JSONPness exist for one purpose: making cross domain requests
 * as domain-agnostic and easy to integrate as possible. Please note that for
 * the associated JavaScript methods to work corretly you will need access to
 * a live version of the PHP backend associated with this code. We attempt to
 * ship this code already configured to work with a live PHP backend, but we
 * recommend hosting your own backend if you have the means to do so.
 * @description The JSONPness global, static object.
 * @name JSONPness
 */
window.JSONPness = {};

//---------------------------------------------------- Private Objects

/*
 * Internal pointer to global JSONPness object.
 * Also used as a prefix for local-global JSONPness specific variables.
 */
var jp = w.JSONPness;

/*
 * Local-global reference to the PHP proxy code.
 * If editing by hand, note that all code expects that the query string
 * delimiter ('?' character) is appended to the URL.
 */
var jpBackendUrl = "http://localhost/JSONPness/bin/json_pness.php?";

/*
 * Holding tank for requests in process.
 * User request callbacks are stored here, mapped to the request via the
 * JSONPness request id.
 */
var jpRequestsInProcess = {};

/*
 * Simple unique request key seed.
 * Request keys need not be complex in current implementation as there is
 * no notion of session with the backend.
 * Do not modify outside of the generate request id utility method.
 */
var jpRequestId = 0;

//---------------------------------------------------- Private methods

/**
 * Generate a unique id for each request sent to the JSONPness backend.
 * @inner
 * @return {number} the next unique request id.
 */
function jpGetNextRequestId() {
    jpRequestId++; // Start counting at 1, instead of a falsey number
    return jpRequestId;
}

/**
 * Handle the response from the JSONPness backend and pass results to the
 * developers callback function.
 * This function must be globally available.
 * NOTE: The name of this function is hardcoded within the send request.
 * @name JSONPness.callback
 * @function
 * @private
 * @param data {object} Data payload, as a JavaScript object literal,
 * returned from the server.
 * @param data.requestId {string} Unique id of JSONPness request. Links response
 * to user callback.
 * @param data.response {string} Response from the JSONPness query.
 * @param [data.error] {string[]} If present, some sort of error occurred
 * during the request process.
 * @todo If the namespace becomes user define-able, need to make sure the
 * send request sends the correctly named callback function.
 */
jp.callback = function JSONPness$callback$(data) {
    var requestId = data.requestId;

    console.log(data.response);
    
    // Trigger callback
    //jpRequestsInProcess[requestId](data.response);

    // Prefer setting to undefined vs. using delete
    jpRequestsInProcess[requestId] = undefined;
};

//---------------------------------------------------- Public Methods

/**
 * Set the URL to the JSONPness backend.
 * All code requires that the the query string delimiter (question mark
 * character) appends the URL string.
 * This function does not append the question mark, nor does the function check
 * to see if the question mark exists.
 * @name JSONPness.setBackendUrL
 * @function
 * @param url {string} The complete URL, including final '?' query string
 * delimiter, to the JSONPness backend.
 */
jp.setBackendUrl = function JSONPness$setBackendUrl$(url) {
    jpBackendUrl = url;
};

/**
 * Get a copy of the URL to the JSONPness backend.
 * @name JSONPness.getBackendUrL
 * @function
 * @return {string} URL where JSONPness requests are sent.
 */
jp.getBackendUrl = function JSONPness$getBackendUrl$() {
    return jpBackendUrl;
};

/**
 * Makes a JSONPness request.
 * @name JSONPness.send
 * @function
 * @param args {object} Collection of arguments written as a JavaScript object
 * literal.
 * @param args.url {string} Where to send our request.
 * @param args.callback {function} When the request returns from the server,
 * this function will be called.
 * @param [args.type="GET"] {string} Valid HTTP request type. Default to "GET"
 * if not included.
 */
jp.send = function JSONPness$send$(args) {

    // Used in two spots: as the callback key and as requestId value in the URL
    var uniqueRequestId = jpGetNextRequestId(),
    // Script tag we will insert
        s = d.createElement("script"),
    // URL that will be proxied the JSONPness backend, concat this first
        url = "url=" + encodeURIComponent(args.url),
    // Unique query string key/value used to track callback
        requestId = "&requestId=" + uniqueRequestId,
    // Our local callback, distinct from the user's callback
        callback = "&callback=" + encodeURIComponent("JSONPness.callback"),
    // Type of request we will make
        requestType = "&requestType=" + (args.type ? args.type : "GET");

    // Store user's callback
    jpRequestsInProcess[uniqueRequestId] = args.callback;
    
    // Make the request
    s.src = jpBackendUrl + url + requestId + callback + requestType;
    d.getElementsByTagName("head")[0].appendChild(s);

    // @todo Cleanup dynamically inserted script tags after query completes.
};

})();
