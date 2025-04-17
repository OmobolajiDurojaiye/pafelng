// Blog Admin JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize CKEditor
    if (document.getElementById('content')) {
        ClassicEditor
            .create(document.getElementById('content'), {
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo'],
                heading: {
                    options: [
                        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                    ]
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    // File upload preview
    const fileInput = document.getElementById('cover_image');
    const fileNameDisplay = document.getElementById('file-name');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileNameDisplay.textContent = file.name;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = 'Choose file';
                previewContainer.style.display = 'none';
            }
        });
    }

    // Delete confirmation modal
    const modal = document.getElementById('delete-modal');
    const deleteButtons = document.querySelectorAll('.delete-post-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const deleteForm = document.getElementById('delete-form');

    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.dataset.postId;
                deleteForm.action = `/admin-blog/posts/${postId}/delete`;
                modal.classList.add('show');
            });
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }

    // Close alerts
    const closeAlerts = document.querySelectorAll('.close-alert');
    if (closeAlerts.length > 0) {
        closeAlerts.forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.parentElement.style.opacity = '0';
                setTimeout(() => {
                    this.parentElement.style.display = 'none';
                }, 300);
            });
        });
    }

    // Add smooth transition to alerts
    const alerts = document.querySelectorAll('.alert');
    if (alerts.length > 0) {
        alerts.forEach(alert => {
            alert.style.transition = 'opacity 0.3s ease';
        });
    }
});