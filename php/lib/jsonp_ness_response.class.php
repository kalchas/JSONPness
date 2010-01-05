<?php
/**
 * @author James Lafferty <james@nearlysensical.com>
 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
 * @package JSONP_Ness
 * @since development
*/

class JSONP_Ness_Response {
	
	public function __construct( $request_id = null, $response = null, $error = null ) {
		
		$this->requestId = $request_id;
		$this->response = $response;
		$this->error = $error;

	}
	
	public function wrap_me( $callback_function = 'alert' ) {
		
		if ( null == $callback_function ) $callback_function = 'alert';
		
		return $callback_function . '(' . json_encode( $this ) . ')()';
		
	}
	
}
?>