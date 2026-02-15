<?php
/**
 * Mock WP_Error class for unit tests.
 *
 * @package FRSUsers\Tests
 */

if ( ! class_exists( 'WP_Error' ) ) {
    /**
     * Minimal WP_Error implementation for testing.
     */
    class WP_Error {
        /**
         * Error code.
         *
         * @var string
         */
        private $code;

        /**
         * Error message.
         *
         * @var string
         */
        private $message;

        /**
         * Error data.
         *
         * @var mixed
         */
        private $data;

        /**
         * Constructor.
         *
         * @param string $code    Error code.
         * @param string $message Error message.
         * @param mixed  $data    Error data.
         */
        public function __construct( $code = '', $message = '', $data = '' ) {
            $this->code = $code;
            $this->message = $message;
            $this->data = $data;
        }

        /**
         * Get error code.
         *
         * @return string
         */
        public function get_error_code() {
            return $this->code;
        }

        /**
         * Get error message.
         *
         * @return string
         */
        public function get_error_message() {
            return $this->message;
        }

        /**
         * Get error data.
         *
         * @return mixed
         */
        public function get_error_data() {
            return $this->data;
        }
    }
}
