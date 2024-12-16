<?php
/**
 * Plugin Name: Loopify Integration
 * Plugin URI: https://loopify.com
 * Description: Integrates your WooCommerce store with Loopify loyalty system
 * Version: 1.0.0
 * Author: Loopify
 * Author URI: https://loopify.com
 * License: GPL v2 or later
 * Text Domain: loopify-integration
 */

if (!defined('ABSPATH')) {
    exit;
}

class Loopify_Integration {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Hook into WooCommerce order status changes
        add_action('woocommerce_order_status_changed', array($this, 'handle_order_status_change'), 10, 4);
        
        // Add menu item
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function handle_order_status_change($order_id, $old_status, $new_status, $order) {
        if ($new_status !== 'completed') {
            return;
        }

        $api_url = get_option('loopify_api_url');
        if (empty($api_url)) {
            return;
        }

        $order = wc_get_order($order_id);
        $customer_id = $order->get_customer_id();
        
        if (!$customer_id) {
            return;
        }

        $customer = new WC_Customer($customer_id);
        
        $data = array(
            'order_id' => $order_id,
            'customer' => array(
                'first_name' => $customer->get_first_name(),
                'last_name' => $customer->get_last_name(),
                'email' => $customer->get_email(),
                'phone' => $customer->get_billing_phone(),
                'address_line1' => $customer->get_billing_address_1(),
                'address_line2' => $customer->get_billing_address_2(),
                'city' => $customer->get_billing_city(),
                'state' => $customer->get_billing_state(),
                'postcode' => $customer->get_billing_postcode(),
                'country' => $customer->get_billing_country()
            ),
            'order' => array(
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
                'items' => array()
            )
        );

        foreach ($order->get_items() as $item) {
            $data['order']['items'][] = array(
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total()
            );
        }

        wp_remote_post($api_url . '/api/webhook/order', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-API-Key' => get_option('loopify_api_key')
            ),
            'body' => json_encode($data)
        ));
    }

    public function add_admin_menu() {
        add_menu_page(
            __('Loopify Settings', 'loopify-integration'),
            __('Loopify', 'loopify-integration'),
            'manage_options',
            'loopify-settings',
            array($this, 'settings_page'),
            'dashicons-awards'
        );
    }

    public function register_settings() {
        register_setting('loopify_settings', 'loopify_api_url');
        register_setting('loopify_settings', 'loopify_api_key');
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form action="options.php" method="post">
                <?php
                settings_fields('loopify_settings');
                do_settings_sections('loopify_settings');
                ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="loopify_api_url"><?php _e('API URL', 'loopify-integration'); ?></label>
                        </th>
                        <td>
                            <input type="url" 
                                   id="loopify_api_url" 
                                   name="loopify_api_url" 
                                   value="<?php echo esc_attr(get_option('loopify_api_url')); ?>" 
                                   class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="loopify_api_key"><?php _e('API Key', 'loopify-integration'); ?></label>
                        </th>
                        <td>
                            <input type="password" 
                                   id="loopify_api_key" 
                                   name="loopify_api_key" 
                                   value="<?php echo esc_attr(get_option('loopify_api_key')); ?>" 
                                   class="regular-text">
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

// Initialize the plugin
add_action('plugins_loaded', array('Loopify_Integration', 'get_instance'));