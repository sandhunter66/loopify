<?php
/**
 * Plugin Name: Loopiify Integration
 * Plugin URI: https://loopiify.netlify.app
 * Description: Integrates your WooCommerce store with Loopiify loyalty system
 * Version: 1.0.0
 * Author: Loopiify
 * Author URI: https://loopiify.netlify.app
 * License: GPL v2 or later
 * Text Domain: loopiify-integration
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class Loopiify_Integration {
    private static $instance = null;
    const VERSION = '1.0.0';

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Check if WooCommerce is active
        if (!$this->check_woocommerce()) {
            return;
        }

        // Plugin activation/deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));

        // Initialize plugin
        add_action('init', array($this, 'init'));
    }

    public function check_woocommerce() {
        if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
            add_action('admin_notices', function() {
                ?>
                <div class="notice notice-error">
                    <p><?php _e('Loopiify Integration requires WooCommerce to be installed and activated.', 'loopiify-integration'); ?></p>
                </div>
                <?php
            });
            return false;
        }
        return true;
    }

    public function activate() {
        // Create necessary database tables or options
        add_option('loopiify_api_url', '');
        add_option('loopiify_api_key', '');
        add_option('loopiify_sync_interval', 'hourly');
    }

    public function deactivate() {
        // Cleanup if needed
        wp_clear_scheduled_hook('loopiify_sync_customers');
    }

    public function init() {
        // Load translations
        load_plugin_textdomain('loopiify-integration', false, dirname(plugin_basename(__FILE__)) . '/languages');

        // Hook into WooCommerce
        add_action('woocommerce_order_status_changed', array($this, 'handle_order_status_change'), 10, 4);
        add_action('woocommerce_new_customer', array($this, 'handle_new_customer'), 10, 1);
        add_action('woocommerce_update_customer', array($this, 'handle_customer_update'), 10, 1);

        // Admin hooks
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_init', array($this, 'register_settings'));
            add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
            add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
        }

        // Schedule sync
        if (!wp_next_scheduled('loopiify_sync_customers')) {
            wp_schedule_event(time(), get_option('loopiify_sync_interval', 'hourly'), 'loopiify_sync_customers');
        }
        add_action('loopiify_sync_customers', array($this, 'sync_customers'));
    }

    public function handle_order_status_change($order_id, $old_status, $new_status, $order) {
        if ($new_status !== 'completed') {
            return;
        }

        $api_url = get_option('loopiify_api_url');
        $api_key = get_option('loopiify_api_key');

        if (empty($api_url) || empty($api_key)) {
            return;
        }

        $customer_id = $order->get_customer_id();
        if (!$customer_id) {
            return;
        }

        $customer = new WC_Customer($customer_id);
        $data = $this->prepare_order_data($order, $customer);

        wp_remote_post($api_url . '/api/webhook/order', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-API-Key' => $api_key
            ),
            'body' => json_encode($data),
            'timeout' => 30
        ));
    }

    private function prepare_order_data($order, $customer) {
        return array(
            'order_id' => $order->get_id(),
            'customer' => array(
                'first_name' => $customer->get_first_name(),
                'last_name' => $customer->get_last_name(),
                'email' => $customer->get_email(),
                'phone' => $this->format_phone_number($customer->get_billing_phone()),
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
                'items' => $this->get_order_items($order)
            )
        );
    }

    private function get_order_items($order) {
        $items = array();
        foreach ($order->get_items() as $item) {
            $items[] = array(
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total()
            );
        }
        return $items;
    }

    private function format_phone_number($phone) {
        // Remove any non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Ensure number starts with 60
        if (!preg_match('/^60/', $phone)) {
            $phone = '60' . preg_replace('/^0+/', '', $phone);
        }
        
        return $phone;
    }

    public function add_admin_menu() {
        add_menu_page(
            __('Loopiify Settings', 'loopiify-integration'),
            __('Loopiify', 'loopiify-integration'),
            'manage_options',
            'loopiify-settings',
            array($this, 'settings_page'),
            'dashicons-awards'
        );
    }

    public function register_settings() {
        register_setting('loopiify_settings', 'loopiify_api_url');
        register_setting('loopiify_settings', 'loopiify_api_key');
        register_setting('loopiify_settings', 'loopiify_woo_consumer_key');
        register_setting('loopiify_settings', 'loopiify_woo_consumer_secret');
    }

    public function settings_page() {
        include plugin_dir_path(__FILE__) . 'templates/settings.php';
    }

    public function enqueue_admin_scripts($hook) {
        if ('toplevel_page_loopiify-settings' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'loopiify-admin',
            plugins_url('assets/css/admin.css', __FILE__),
            array(),
            self::VERSION
        );

        wp_enqueue_script(
            'loopiify-admin',
            plugins_url('assets/js/admin.js', __FILE__),
            array('jquery'),
            self::VERSION,
            true
        );
    }

    public function add_settings_link($links) {
        $settings_link = '<a href="admin.php?page=loopiify-settings">' . __('Settings', 'loopiify-integration') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}

// Initialize the plugin
add_action('plugins_loaded', array('Loopiify_Integration', 'get_instance'));