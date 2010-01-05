<?php
/**
 * @author James Lafferty <james@nearlysensical.com>
 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
 * @package JSON_PNess
 * @since 0.1
*/

class JSON_PNess_Response {
	
	public function __construct( $request_id = null, $response = null, $error = null ) {
		
		$this->requestID = $request_id;
		$this->response = $response;
		$this->error = $error;

	}
	
	public function wrap_me( $callback_function = 'document.write' ) {
		
		if ( null == $callback_function ) $callback_function = 'document.write';
		
		return '('. $callback_function . '(' . json_encode( $this ) . '))()';
		
	}
	
}
?>