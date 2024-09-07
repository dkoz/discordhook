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
        if ($('.embed-group').length < 10) {
            $('#embeds').append(`
                <div class="form-group embed-group">
                    <label>Embed</label>
                    <input type="text" class="form-control embed-title" placeholder="Title">
                    <input type="url" class="form-control embed-thumbnail" placeholder="Thumbnail URL">
                    <input type="url" class="form-control embed-image" placeholder="Image URL">
                    <textarea class="form-control embed-description" rows="3" placeholder="Description"></textarea>
                    <div class="embed-fields"></div>
                    <button type="button" class="btn btn-secondary mt-2 add-field">Add Field</button>
                    <button type="button" class="btn btn-danger mt-2 remove-embed">Remove Embed</button>
                </div>
            `);
            debouncedUpdatePreview();
        } else {
            alert('Maximum number of embeds reached.');
        }
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
        $('#loading-spinner').show();
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
                $('#modal-body').text('Webhook sent successfully!');
                $('#statusModal').modal('show');
            },
            error: function(xhr, status, error) {
                $('#modal-body').text('Failed to send webhook: ' + error);
                $('#statusModal').modal('show');
            },
            complete: function() {
                $('#loading-spinner').hide();
            }
        });

        $('#preview').html(renderPreview(payload));
    });

    $('#load-webhook').click(function() {
        let webhookUrl = $('#webhook-url').val();
        let messageId = $('#message-id').val();
        if (!webhookUrl || !messageId) {
            alert('Please enter both Webhook URL and Message ID.');
            return;
        }

        $.ajax({
            url: '/load_webhook',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ webhook_url: webhookUrl, message_id: messageId }),
            success: function(response) {
                if (response) {
                    $('#webhook-username').val(response.username);
                    $('#webhook-avatar').val(response.avatar_url);
                    $('#webhook-content').val(response.content);
                    
                    if (response.embeds) {
                        $('#embeds').empty();
                        response.embeds.forEach(embed => {
                            $('#embeds').append(`
                                <div class="form-group embed-group">
                                    <label>Embed</label>
                                    <input type="text" class="form-control embed-title" placeholder="Title" value="${embed.title}">
                                    <input type="url" class="form-control embed-thumbnail" placeholder="Thumbnail URL" value="${embed.thumbnail ? embed.thumbnail.url : ''}">
                                    <input type="url" class="form-control embed-image" placeholder="Image URL" value="${embed.image ? embed.image.url : ''}">
                                    <textarea class="form-control embed-description" rows="3" placeholder="Description">${embed.description}</textarea>
                                    <div class="embed-fields"></div>
                                    <button type="button" class="btn btn-secondary mt-2 add-field">Add Field</button>
                                    <button type="button" class="btn btn-danger mt-2 remove-embed">Remove Embed</button>
                                </div>
                            `);
                            
                            embed.fields.forEach(field => {
                                $('.embed-fields:last').append(`
                                    <div class="form-group embed-field-group">
                                        <input type="text" class="form-control embed-field-name" placeholder="Field Name" value="${field.name}">
                                        <input type="text" class="form-control embed-field-value" placeholder="Field Value" value="${field.value}">
                                        <button type="button" class="btn btn-danger mt-2 remove-field">Remove Field</button>
                                    </div>
                                `);
                            });
                        });
                    }
                    debouncedUpdatePreview();
                } else {
                    alert('No data found for this webhook message.');
                }
            },
            error: function(xhr, status, error) {
                alert('Failed to load webhook message: ' + error);
            }
        });
    });

    
    $('#update-webhook').click(function() {
        let webhookUrl = $('#webhook-url').val();
        let messageId = $('#message-id').val();
        if (!webhookUrl || !messageId) {
            alert('Please enter both Webhook URL and Message ID.');
            return;
        }

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

        $.ajax({
            url: `/update_webhook/${messageId}`,
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({webhook_url: webhookUrl, payload: payload}),
            success: function(response) {
                $('#modal-body').text('Webhook message updated successfully!');
                $('#statusModal').modal('show');
            },
            error: function(xhr, status, error) {
                $('#modal-body').text('Failed to update webhook: ' + error);
                $('#statusModal').modal('show');
            }
        });
    });
});
