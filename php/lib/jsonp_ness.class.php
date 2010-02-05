<?php
/**
 * @author James Lafferty <james@nearlysensical.com>
 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
 * @package JSONP_Ness
 * @since development
*/

class JSONP_Ness {
	
	private $errors = array();
	
	public static $cached_responses;
	
	private static $ch;
	private static $last_response;
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @return JSONP_Ness object
	 * @since development
	*/
	
	public function __construct() {
	
		JSONP_Ness::init_ch();
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since development
	*/
	
	public function __destruct() {
	
		JSONP_Ness::destroy_ch();
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @param $callback
	 * @param $request_id
	 * @param $url
	 * @param $request_type
	 * @param $request_params
	 * @since development
	 * @todo Add authentication.
	*/
	
	public function dial_url( $callback = null, $request_id = null, $url = null, $request_type = 'GET', $request_params = null, $headers = null ) {
	
	/*
		// This is temporarily commented out to be placed elsewhere. bin/jsonp_ness.php was edited to filter out bad requests earlier.
		// Check that all necessary parameters are provided and record errors if they are not.
		
		if ( null == $callback ) $this->errors[] = new JSONP_Ness_Exception( '"callback" is a required field.' );
		if ( null == $request_id ) $this->errors[] = new JSONP_Ness_Exception( '"requestId" is a required field' );
		if ( null == $url ) $this->errors[] = new JSONP_Ness_Exception( '"url" is a required field' );
		
		if ( isset( $this->errors ) && 0 < count( $this->errors ) ) {
			
			$error = array();
			
			foreach ( $this->errors as $key => $value ) {

				$error[ $key ] = $value->getMessage();
				
			}
			
			$jsonp_ness_response = new JSONP_Ness_Response( $request_id, null, json_encode( $error ) );
			JSONP_Ness::$last_response = $jsonp_ness_response->wrap_me( $callback );
			return JSONP_Ness::$last_response; // Return the error if anything is missing.
			
		}
	*/
		
		// Check if we've got a POST request coming through. If so, we need to set the parameters for the POST.
		
		if ( 'POST' == $request_type ) {
			
			JSONP_Ness::set_option( CURLOPT_POST, 1 );
			
			if ( null != $request_params ) JSONP_Ness::set_option( CURLOPT_POSTFIELDS, $request_params ); // Set the post fields if they exist.
			
		}
		
		if ( null != $headers ) JSONP_Ness::set_option( CURLOPT_HTTPHEADERS, $headers);
		
		JSONP_Ness::set_option( CURLOPT_URL, $url );
		JSONP_Ness::exec_ch( $callback, $request_id );
		return JSONP_Ness::$last_response;
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @param $url
	 * @since development
	*/
	
	public function kickback( $url = null ) {
	
		if ( null == $url ) {
		
			return JSONP_Ness::$last_response;
			
		} elseif ( null != $url && isset( JSONP_Ness::$cached_responses[$url] ) ) {
		
			return JSONP_Ness::$cached_responses[$url];
			
		} elseif ( ! isset( JSONP_Ness::$cached_responses[$url] ) ) {
		
			 $this->errors[] = new JSONP_Ness_Exception( 'Sorry, I haven\'t dialed that url yet.' );
			 
		
		}
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since development
	*/
		
	private static function destroy_ch() {
	
		curl_close( JSONP_Ness::$ch );
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since development
	*/
	
	private static function exec_ch( $callback, $request_id ) { 
	
		$result = curl_exec( JSONP_Ness::$ch );
		$jsonp_ness_response = new JSONP_Ness_Response( $request_id, $result );
		JSONP_Ness::$last_response = $jsonp_ness_response->wrap_me( $callback );
		JSONP_Ness::$cached_responses[ curl_getinfo( JSONP_Ness::$ch, CURLINFO_EFFECTIVE_URL ) ] = JSONP_Ness::$last_response;
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since development
	*/
	
	private static function init_ch() {

		JSONP_Ness::$ch = curl_init();
		JSONP_Ness::set_option( CURLOPT_RETURNTRANSFER, true ); // Don't print the curl result directly.

	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @param $key
	 * @param $value
	 * @since development
	*/
	
	private static function set_option( $key, $value ) {
	
		curl_setopt( JSONP_Ness::$ch, $key, $value );
	
	}

}
?>