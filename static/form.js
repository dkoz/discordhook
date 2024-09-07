$(document).ready(function() {
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function updatePreview() {
        let payload = {
            username: $('#webhook-username').val(),
            avatar_url: $('#webhook-avatar').val(),
            content: $('#webhook-content').val(),
            embeds: []
        };

        $('.embed-group').each(function() {
            let embed = {
                title: $(this).find('.embed-title').val(),
                thumbnail: { url: $(this).find('.embed-thumbnail').val() },
                image: { url: $(this).find('.embed-image').val() },
                description: $(this).find('.embed-description').val(),
                fields: []
            };
            $(this).find('.embed-field-group').each(function() {
                let field = {
                    name: $(this).find('.embed-field-name').val(),
                    value: $(this).find('.embed-field-value').val()
                };
                embed.fields.push(field);
            });
            payload.embeds.push(embed);
        });

        $('#preview').html(renderPreview(payload));
    }

    const debouncedUpdatePreview = debounce(updatePreview, 300);

    function renderPreview(payload) {
        let previewHtml = '';

        if (payload.username) {
            previewHtml += `<div><strong>${payload.username}</strong></div>`;
        }
        if (payload.avatar_url) {
            previewHtml += `<div><img src="${payload.avatar_url}" alt="avatar" style="width:50px; height:50px;"></div>`;
        }
        if (payload.content) {
            previewHtml += `<div>${payload.content}</div>`;
        }

        payload.embeds.forEach(embed => {
            previewHtml += `<div class="embed-preview">`;
            if (embed.title) {
                previewHtml += `<div><strong>${embed.title}</strong></div>`;
            }
            if (embed.description) {
                previewHtml += `<div>${embed.description}</div>`;
            }
            if (embed.thumbnail && embed.thumbnail.url) {
                previewHtml += `<div><img src="${embed.thumbnail.url}" alt="thumbnail" style="width:50px; height:50px;"></div>`;
            }
            if (embed.image && embed.image.url) {
                previewHtml += `<div><img src="${embed.image.url}" alt="image" style="width:100%;"></div>`;
            }
            embed.fields.forEach(field => {
                previewHtml += `<div><strong>${field.name}</strong>: ${field.value}</div>`;
            });
            previewHtml += `</div>`;
        });

        return previewHtml;
    }

    $('#add-embed').click(function() {
        $('#embeds').append(`
            <div class="form-group embed-group">
                <label>Embed</label>
                <input type="text" class="form-control embed-title" placeholder="Title">
                <input type="url" class="form-control embed-thumbnail" placeholder="Thumbnail URL">
                <input type="url" class="form-control embed-image" placeholder="Image URL">
                <textarea class="form-control embed-description" rows="3" placeholder="Description"></textarea>
                <div class="embed-fields">
                    <div class="form-group">
                        <label>Fields</label>
                        <div class="embed-field-group">
                            <input type="text" class="form-control embed-field-name" placeholder="Field Name">
                            <input type="text" class="form-control embed-field-value" placeholder="Field Value">
                            <button type="button" class="btn btn-danger mt-2 remove-field">Remove Field</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary mt-2 add-field">Add Field</button>
                <button type="button" class="btn btn-danger mt-2 remove-embed">Remove Embed</button>
            </div>
        `);
        debouncedUpdatePreview();
    });

    $(document).on('click', '.add-field', function() {
        $(this).siblings('.embed-fields').append(`
            <div class="form-group embed-field-group">
                <input type="text" class="form-control embed-field-name" placeholder="Field Name">
                <input type="text" class="form-control embed-field-value" placeholder="Field Value">
                <button type="button" class="btn btn-danger mt-2 remove-field">Remove Field</button>
            </div>
        `);
        debouncedUpdatePreview();
    });

    $(document).on('click', '.remove-embed', function() {
        $(this).closest('.embed-group').remove();
        debouncedUpdatePreview();
    });

    $(document).on('click', '.remove-field', function() {
        $(this).closest('.embed-field-group').remove();
        debouncedUpdatePreview();
    });

    $(document).on('input', 'input, textarea', function() {
        debouncedUpdatePreview();
    });

    $('#webhook-form').submit(function(e) {
        e.preventDefault();
        let payload = {
            username: $('#webhook-username').val(),
            avatar_url: $('#webhook-avatar').val(),
            content: $('#webhook-content').val(),
            embeds: []
        };

        let thread_id = $('#webhook-thread').val();

        $('.embed-group').each(function() {
            let embed = {
                title: $(this).find('.embed-title').val(),
                thumbnail: { url: $(this).find('.embed-thumbnail').val() },
                image: { url: $(this).find('.embed-image').val() },
                description: $(this).find('.embed-description').val(),
                fields: []
            };
            $(this).find('.embed-field-group').each(function() {
                let field = {
                    name: $(this).find('.embed-field-name').val(),
                    value: $(this).find('.embed-field-value').val()
                };
                embed.fields.push(field);
            });
            payload.embeds.push(embed);
        });

        $.ajax({
            url: '/send_webhook',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({webhook_url: $('#webhook-url').val(), payload: payload, thread_id: thread_id}),
            success: function(response) {
                alert('Webhook sent!');
            },
            error: function(xhr, status, error) {
                alert('Failed to send webhook: ' + error);
            }
        });

        $('#preview').html(renderPreview(payload));
    });
});
