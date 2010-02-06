// #ifdef debug
// if the preprocessor is running, logger defined for debug builds _only_
/*!
 * Simple JavaScript logger.
 * Cross browser, even mobile browser with a bit of tweaking.
 *
 * Usage:
 * log.debug( "log message as string" );
 * log.info( "log message as string" );
 * log.warn( "log message as string" );
 * log.error( "log message as string" );
 * also:
 * log("log message"); // Shorthand and synonym for log.debug
 *
 * Inspiration:
 * jslog by Andre Lewis, andre@earthcode.com
 * http://www.earthcode.com/tools/jslog
 *
 * @author Jeremy Osborne,
 * me at jeremyosborne dot com
 *
 * @version alpha
 */

(function() {

//-------------------------------------- Private (local-global) code
/*
 * shorthand references
 */
var win = window,
    doc = document;
/*
 * The logger is initalized when the first log message is triggered.
 */
var initialized = false;

/*
 * Global name of logger (e.g. becomes window.log).
 */
var jslogName = "log";
/*
 * Associative key for the debug function (e.g. log.debug).
 * Warning: changing this will change global access to the logger.
 */
var debugName = "debug";
/*
 * Associative key for the info function (e.g. log.info).
 * Warning: changing this will change global access to the logger.
 */
var infoName = "info";
/*
 * Associative key for the debug function (e.g. log.warning).
 * Warning: changing this will change global access to the logger.
 */
var warnName = "warn";
/*
 * Associative key for the debug function (e.g. log.error).
 * Warning: changing this will change global access to the logger.
 */
var errorName = "error";
/*
 * This length is a very cheesy way of padding out the warning level messages
 * and avoiding the need of a float.
 * Manually write in the length of the longest function key (infoName, warnName,
 * etc.).
 */
var maxNameLength = 5;
/*
 * HTML ID of the container of the logging console.
 */
var domId = "jslogger_console";

/*
 * Integer number of messages that currently reside in the log.
 */
var numMessagesLogged = 0;

/*
 * Logger redirection setup.
 */
var attemptToRedirect = true;
/*
 * Where we will redirectTo, if possible
 */
var redirectTo = null;

/*
 * Shorthand get element by id.
 */
function getElementById(o){
    return doc.getElementById(o);
}
/*
 * Shorthand document.createElement.
 */
function createElement(s) {
    return doc.createElement(s);
}

/*
 * Output the message. All logging messages pass into here.
 */
function logMsg(level, msg) {
    /*
     * Kick off the set-up process here.
     * Any other code execution can be traced from this function.
     */
    init();

    if ( redirectTo ) {
        // Redirector has been set-up
        redirectTo( level.toUpperCase() + " " +
            getCurrentTimeFormatted() + " " +
            msg);
    }
    else {
        // No Redirector, use DOM log manager
        // increase the count in the handle
        numMessagesLogged += 1;
        getElementById(domId+'_handle').innerHTML = numMessagesLogged;
        // Append the log to a display div so it can be seen right away
        var oDisplay = getElementById(domId+'_logDisplay');
        var newLogEntry = createDisplayRow(level, msg);
        if (oDisplay.childNodes.length == 0 ) {
            oDisplay.appendChild(newLogEntry);
        } else {
            oDisplay.insertBefore(newLogEntry, oDisplay.childNodes[0]);
        }
    }
}

/*
 * Creates the row to add the the display div.
 */
function createDisplayRow(lvl, msg) {

    var logentry = createElement("div");
    // zebra stripe
    if (numMessagesLogged/2 == Math.floor(numMessagesLogged/2)) {
        logentry.style.backgroundColor = "#FFF";
    } else {
        logentry.style.backgroundColor = "#F6F6F6";
    }
    logentry.style.borderBottom = "1px solid #AAA";

    var severity = createElement("span");
    severity.style.paddingLeft = "3px";
    severity.style.paddingRight = "3px";
    severity.style.fontFamily = "monospace";
    // different styles for different severities
    if (lvl == debugName) {
        severity.style.backgroundColor = "#1515FF";
    }
    else if (lvl == infoName) {
        severity.style.backgroundColor = "#10FF10";
    }
    else if (lvl == warnName) {
        severity.style.backgroundColor = "yellow";
    }
    else if (lvl == errorName) {
        severity.style.backgroundColor = "#FF7070";
    }
    severity.innerHTML = formatSeverity();
    logentry.appendChild(severity);

    var time = createElement("span");
    time.style.paddingLeft = "3px";
    time.style.paddingRight = "8px";
    time.style.fontFamily = "monospace";
    time.innerHTML = getCurrentTimeFormatted();
    logentry.appendChild(time);

    var message = createElement("span");
    message.innerHTML = msg;
    logentry.appendChild(message);

    return logentry;
    //----------------------------------- Inner functions
    /*
     * Return the formatted message type string, padded with whitespace
     * (assume monospace font-family).
     * Workaround to avoid tables (even though they are appropriate here)
     * and floats and still achieve equal spacing using spans.
     */
    function formatSeverity () {
        // lvl from outer function
        var numNeededSpaces = maxNameLength - lvl;
        for ( var i = 0; i < numNeededSpaces; i++ ) {
            lvl += " ";
        }
        return lvl.toUpperCase();
    }
}

/*
 * Returns a formatted time string.
 */
function getCurrentTimeFormatted() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds()
    var timeValue = "" + ((hours < 10) ? "0" : "") + hours;
    timeValue += ((minutes < 10) ? ":0" : ":") + minutes;
    timeValue += ((seconds < 10) ? ":0" : ":") + seconds;

    return timeValue;
}

/*
 * Initialization code. It's wrapped in a try-catch block because if something here
 * fails, there is no other notification
 */
function init() {

    if (initialized) {
        return;
    }
    // Only call this once
    initialized = true;
    // Try to redirect to a native logger
    if (true == attemptToRedirect) {
        if ( win.console && win.console.log ) {
            // Most of todays browsers
            redirectTo = function (s) {
                win.console.log(s);
            };
        }
        else if (win.opera && win.opera.postError) {
            // Opera
            redirectTo = function (s) {
                win.opera.postError(s);
            }
        }
    }
    // If we can redirect, make onscreen logger
    if ( !redirectTo ) {
        // CSS for control buttons
        var buttonStyle = "cursor:pointer; background-color:#FFFFCC; border:1px solid #FF0400; color:black; padding:2px 2px 2px 2px;";
        // This is ghetto, but workable.
        var consoleHTML = "" +
            '<div id="'+domId+'" style="font-family:arial; color:black; font-size:9px; position:absolute; z-index:10000; bottom:30px; right:30px; width:300px; height:325px;">'+
              '<div id="'+domId+'_header">'+
                '<span id="'+domId+'_handle" style="'+buttonStyle+'">0</span>'+
                '<span style="'+buttonStyle+'" onclick="'+jslogName+'.toggleDisplay()">show/hide</span>'+
                '<span style="'+buttonStyle+'" onclick="'+jslogName+'.clearLog()">clear</span>'+
              '</div>'+
              '<div id="'+domId+'_body" style="text-align:left; border:1px solid #FF0400; position:absolute; top:20px; left:0px; background-color:white; display:none">'+
                '<div id="'+domId+'_logDisplay" style="height:300px; width:300px; overflow:auto;"></div>'+
              '</div>' +
            '</div>';
        doc.write(consoleHTML);
    }
}


//-------------------------------------------------------- Public Code

/**
 * @class JavaScript logger.
 * This method can be used as shorthand to logging debug level messages.
 * @param msg {string} Message to log.
 */
win[jslogName] = function (msg) {
    logMsg(debugName, msg);
};

/**
 * Log a debug level message.
 * @param msg {string} Message to log.
 */
win[jslogName][debugName] = function (msg) {
    logMsg(debugName, msg);
};

/**
 * Log an info level message.
 * @param msg {string} Message to log.
 */
win[jslogName][infoName] = function (msg) {
    logMsg(infoName, msg);
};

/**
 * Log a warning level message.
 * @param msg {string} Message to log.
 */
win[jslogName][warnName] = function (msg) {
    logMsg(warnName, msg);
};

/**
 * Log an error level message.
 * @param msg {string} Message to log.
 */
win[jslogName][errorName] = function (msg) {
    logMsg(errorName, msg);
};

/**
 * Toggle the display of the console.
 */
win[jslogName].toggleDisplay = function () {
    var oBody = getElementById(domId+'_body');
    if (oBody.style.display == 'none') {
        oBody.style.display = 'block';
    } else {
        oBody.style.display = 'none';
    }
};

/**
 * Clear the on-screen display.
 */
win[jslogName].clearLog = function () {
    getElementById(domId+'_logDisplay').innerHTML = '';
    numMessagesLogged = 0;
    getElementById(domId+'_handle').innerHTML = numMessagesLogged;
};

})();
//////////////////////////////////////////////////////// End logger code
// #endif
