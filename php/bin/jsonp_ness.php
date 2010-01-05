<?php
/**
 * 
 * @author James Lafferty
 * @version development
 * @package JSONP_Ness
*/

// Extend the default autoloader for JSONP_Ness.

DEFINE( 'LIB_DIR', realpath( dirname( __FILE__) . '/../lib/' ) ); // Get absolute path to lib.
set_include_path( get_include_path() . PATH_SEPARATOR . LIB_DIR . PATH_SEPARATOR ); // Add lib to the include path.
spl_autoload_extensions('.class.php'); // Add '.class.php' to the list of class extensions that will be autoloaded.
spl_autoload_register();

$jsonp_ness = new JSONP_Ness(); // Create a JSONP_Ness

// Set dial_url variables according to incoming GET request.
if ( isset( $_GET ) && null != $_GET ) {

	$callback = $_GET[ 'callback' ];
	$request_id = $_GET['requestId'];
	$url = $_GET['url'];

} else {
	
	$callback = null;
	$request_id = null;
	$url = null;
	
}

// Dial the url.
$response = $jsonp_ness->dial_url( $callback, $request_id, $url );

// Create header.
header( 'Content-type: text/javascript' );

// Pass back the response.
echo $response;
?>