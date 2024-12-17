<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="loopify-settings-container">
        <form action="options.php" method="post">
            <?php
            settings_fields('loopiify_settings');
            do_settings_sections('loopiify_settings');
            ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="loopiify_api_url"><?php _e('API URL', 'loopiify-integration'); ?></label>
                    </th>
                    <td>
                        <input type="url" 
                               id="loopiify_api_url" 
                               name="loopiify_api_url" 
                               value="<?php echo esc_attr(get_option('loopiify_api_url')); ?>" 
                               class="regular-text">
                        <p class="description">
                            <?php _e('Default: https://loopiify.netlify.app', 'loopiify-integration'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="loopiify_api_key"><?php _e('API Key', 'loopiify-integration'); ?></label>
                    </th>
                    <td>
                        <input type="password" 
                               id="loopiify_api_key" 
                               name="loopiify_api_key" 
                               value="<?php echo esc_attr(get_option('loopiify_api_key')); ?>" 
                               class="regular-text">
                        <p class="description">
                            <?php _e('Enter your Loopify API Key', 'loopify-integration'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="loopify_sync_interval"><?php _e('Sync Interval', 'loopify-integration'); ?></label>
                    </th>
                    <td>
                        <select id="loopify_sync_interval" name="loopify_sync_interval">
                            <option value="hourly" <?php selected(get_option('loopify_sync_interval'), 'hourly'); ?>>
                                <?php _e('Hourly', 'loopify-integration'); ?>
                            </option>
                            <option value="twicedaily" <?php selected(get_option('loopify_sync_interval'), 'twicedaily'); ?>>
                                <?php _e('Twice Daily', 'loopify-integration'); ?>
                            </option>
                            <option value="daily" <?php selected(get_option('loopify_sync_interval'), 'daily'); ?>>
                                <?php _e('Daily', 'loopify-integration'); ?>
                            </option>
                        </select>
                        <p class="description">
                            <?php _e('Select how often to sync customer data', 'loopify-integration'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="loopiify_woo_consumer_key"><?php _e('WooCommerce Consumer Key', 'loopiify-integration'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="loopiify_woo_consumer_key" 
                               name="loopiify_woo_consumer_key" 
                               value="<?php echo esc_attr(get_option('loopiify_woo_consumer_key')); ?>" 
                               class="regular-text">
                        <p class="description">
                            <?php _e('Generate this in WooCommerce > Settings > Advanced > REST API', 'loopiify-integration'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="loopiify_woo_consumer_secret"><?php _e('WooCommerce Consumer Secret', 'loopiify-integration'); ?></label>
                    </th>
                    <td>
                        <input type="password" 
                               id="loopiify_woo_consumer_secret" 
                               name="loopiify_woo_consumer_secret" 
                               value="<?php echo esc_attr(get_option('loopiify_woo_consumer_secret')); ?>" 
                               class="regular-text">
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>

        <div class="loopify-info-box">
            <h3><?php _e('Integration Status', 'loopiify-integration'); ?></h3>
            <p>
                <?php
                $api_url = get_option('loopiify_api_url');
                $api_key = get_option('loopiify_api_key');
                $woo_key = get_option('loopiify_woo_consumer_key');
                $woo_secret = get_option('loopiify_woo_consumer_secret');
                
                if (!empty($api_url) && !empty($api_key) && !empty($woo_key) && !empty($woo_secret)) {
                    echo '<span class="loopify-status-ok">' . __('✓ Integration configured', 'loopiify-integration') . '</span>';
                } else {
                    echo '<span class="loopify-status-error">' . __('⚠ Integration not configured', 'loopiify-integration') . '</span>';
                    if (empty($woo_key) || empty($woo_secret)) {
                        echo '<br><span class="loopify-status-error">' . __('⚠ WooCommerce API credentials missing', 'loopiify-integration') . '</span>';
                    }
                }
                ?>
            </p>
            <p>
                <?php
                $next_sync = wp_next_scheduled('loopiify_sync_customers');
                if ($next_sync) {
                    printf(
                        __('Next sync scheduled for: %s', 'loopiify-integration'),
                        date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $next_sync)
                    );
                }
                ?>
            </p>
            <div class="loopify-help-box">
                <h4><?php _e('WooCommerce API Setup Instructions', 'loopiify-integration'); ?></h4>
                <ol>
                    <li><?php _e('Go to WooCommerce > Settings > Advanced > REST API', 'loopiify-integration'); ?></li>
                    <li><?php _e('Click "Add Key" to create new API credentials', 'loopiify-integration'); ?></li>
                    <li><?php _e('Description: "Loopiify Integration"', 'loopiify-integration'); ?></li>
                    <li><?php _e('User: Select an admin user', 'loopiify-integration'); ?></li>
                    <li><?php _e('Permissions: Read', 'loopiify-integration'); ?></li>
                    <li><?php _e('Copy the Consumer Key and Consumer Secret', 'loopiify-integration'); ?></li>
                    <li><?php _e('Paste them in the fields above', 'loopiify-integration'); ?></li>
                </ol>
            </div>
        </div>
    </div>
</div>