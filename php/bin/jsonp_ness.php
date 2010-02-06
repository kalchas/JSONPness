<?php
/**
 * 
 * @author James Lafferty
 * @todo Add error handling for missing parameters.
 * @version development
 * @package JSONP_Ness
*/

// Extend the default autoloader for JSONP_Ness.

DEFINE( 'LIB_DIR', realpath( dirname( __FILE__) . '/../lib/' ) ); // Get absolute path to lib.
set_include_path( get_include_path() . PATH_SEPARATOR . LIB_DIR . PATH_SEPARATOR ); // Add lib to the include path.
spl_autoload_extensions('.class.php'); // Add '.class.php' to the list of class extensions that will be autoloaded.
spl_autoload_register();

// Create header.
header( 'Content-type: text/javascript' );

if ( isset( $_GET ) && null != $_GET && isset( $_GET['callback'] ) && isset( $_GET['requestId'] ) && isset( $_GET['url'] ) ) {

	$jsonp_ness = new JSONP_Ness(); // Create a JSONP_Ness

	// Set required dial_url parameters according to incoming GET request.
	$callback = $_GET['callback'];
	$request_id = $_GET['requestId'];
	$url = $_GET['url'];
	
	// Set optional dial_url parameters to defaults.
	$request_type = 'GET';
	$request_params = null;
	$headers = null;
	
	// Check whether we've got an incoming requestType.
	if ( isset( $_GET['requestType'] ) ) {
		
		$request_type = $_GET['requestType' ];
		
		// Check whether we've got any urlParams coming in.
		if ( isset ( $_GET['params'] ) ) {
			
			$request_params = json_decode( $_GET['params'], true ); // json_decode the urlParams as an associative array.
		
		}
			
	} 
	
	if ( isset( $_GET['headers'] ) ) {
		
		$headers = json_decode( $_GET['headers'], true );
		
	}

	// Dial the url.
	$response = $jsonp_ness->dial_url( $callback, $request_id, $url, $request_type, $request_params, $headers );

	// Pass back the response.
	echo $response;

} else {

	
}
?>