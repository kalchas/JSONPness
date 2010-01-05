<?php
/**
 * @author James Lafferty <james@nearlysensical.com>
 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
 * @package JSON_PNess
 * @since 0.1
*/

class JSON_PNess {
	
	private $errors = array();
	
	public static $cached_responses;
	
	private static $ch;
	private static $last_response;
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @return JSON_PNess object
	 * @since 0.1
	*/
	
	public function __construct() {
	
		JSON_PNess::init_ch();
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since 0.1
	*/
	
	public function __destruct() {
	
		JSON_PNess::destroy_ch();
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @param $callback
	 * @param $request_id
	 * @param $url
	 * @since 0.1
	*/
	
	public function dial_url( $callback = null, $request_id = null, $url = null ) {
	
		if ( null == $callback ) $this->errors[] = new JSON_PNess_Exception( '"callback" is a required field.' );
		if ( null == $request_id ) $this->errors[] = new JSON_PNess_Exception( '"requestId" is a required field' );
		if ( null == $url ) $this->errors[] = new JSON_PNess_Exception( '"url" is a required field' );
		
		if ( isset( $this->errors ) && 0 < count( $this->errors ) ) {
			
			$error = array();
			
			foreach ( $this->errors as $key => $value ) {

				$error[ $key ] = $value->getMessage();
				
			}
			
			$json_pness_response = new JSON_PNess_Response( $request_id, null, json_encode( $error ) );
			JSON_PNess::$last_response = $json_pness_response->wrap_me( $callback );
			return JSON_PNess::$last_response;
			
		}
		
		JSON_PNess::set_option( CURLOPT_URL, $url );
		JSON_PNess::exec_ch( $callback, $request_id );
		return JSON_PNess::$last_response;
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @param $url
	 * @since 0.1
	*/
	
	public function kickback( $url = null ) {
	
		if ( null == $url ) {
		
			return JSON_PNess::$last_response;
			
		} elseif ( null != $url && isset( JSON_PNess::$cached_responses[$url] ) ) {
		
			return JSON_PNess::$cached_responses[$url];
			
		} elseif ( ! isset( JSON_PNess::$cached_responses[$url] ) ) {
		
			 $this->errors[] = new JSON_PNess_Exception( 'Sorry, I haven\'t dialed that url yet.' );
			 
		
		}
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since 0.1
	*/
		
	private static function destroy_ch() {
	
		curl_close( JSON_PNess::$ch );
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since 0.1
	*/
	
	private static function exec_ch( $callback, $request_id ) { 
	
		$result = curl_exec( JSON_PNess::$ch );
		$json_pness_response = new JSON_PNess_Response( $request_id, $result );
		JSON_PNess::$last_response = $json_pness_response->wrap_me( $callback );
		JSON_PNess::$cached_responses[ curl_getinfo( JSON_PNess::$ch, CURLINFO_EFFECTIVE_URL ) ] = JSON_PNess::$last_response;
	
	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @since 0.1
	*/
	
	private static function init_ch() {

		JSON_PNess::$ch = curl_init();
		JSON_PNess::set_option( CURLOPT_RETURNTRANSFER, true ); // Don't print the curl result directly.

	}
	
	/**
	 * @author James Lafferty <james@nearlysensical.com>
	 * @copyright 2009 (c), James Lafferty and Jeremy Osborne
	 * @param $key
	 * @param $value
	 * @since 0.1
	*/
	
	private static function set_option( $key, $value ) {
	
		curl_setopt( JSON_PNess::$ch, $key, $value );
	
	}

}
?>