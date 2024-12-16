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
                        <p class="description">
                            <?php _e('Enter your Loopify API URL', 'loopify-integration'); ?>
                        </p>
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
            </table>
            
            <?php submit_button(); ?>
        </form>

        <div class="loopify-info-box">
            <h3><?php _e('Integration Status', 'loopify-integration'); ?></h3>
            <p>
                <?php
                $api_url = get_option('loopify_api_url');
                $api_key = get_option('loopify_api_key');
                if (!empty($api_url) && !empty($api_key)) {
                    echo '<span class="loopify-status-ok">' . __('✓ Integration configured', 'loopify-integration') . '</span>';
                } else {
                    echo '<span class="loopify-status-error">' . __('⚠ Integration not configured', 'loopify-integration') . '</span>';
                }
                ?>
            </p>
            <p>
                <?php
                $next_sync = wp_next_scheduled('loopify_sync_customers');
                if ($next_sync) {
                    printf(
                        __('Next sync scheduled for: %s', 'loopify-integration'),
                        date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $next_sync)
                    );
                }
                ?>
            </p>
        </div>
    </div>
</div>