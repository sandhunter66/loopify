jQuery(document).ready(function($) {
    // Toggle password visibility
    $('#loopify_api_key').after('<button type="button" class="button button-secondary" id="toggle-api-key">Show</button>');
    
    $('#toggle-api-key').on('click', function(e) {
        e.preventDefault();
        var $input = $('#loopify_api_key');
        var $button = $(this);
        
        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $button.text('Hide');
        } else {
            $input.attr('type', 'password');
            $button.text('Show');
        }
    });

    // Validate settings before save
    $('form').on('submit', function(e) {
        var apiUrl = $('#loopify_api_url').val();
        var apiKey = $('#loopify_api_key').val();
        
        if (!apiUrl || !apiKey) {
            if (!confirm('Some settings are empty. Are you sure you want to save?')) {
                e.preventDefault();
            }
        }
    });
});