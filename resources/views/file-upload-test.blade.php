<!DOCTYPE html>
<html>
<head>
    <title>File Upload Test</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Direct File Upload Test</h1>
    
    <form id="testForm" enctype="multipart/form-data">
        <div>
            <label>Content:</label>
            <input type="text" name="content" value="Test post with image" required>
        </div>
        <div>
            <label>Image:</label>
            <input type="file" name="images[]" accept="image/*" multiple>
        </div>
        <button type="submit">Submit Test</button>
    </form>

    <div id="result"></div>

    <script>
        document.getElementById('testForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const result = document.getElementById('result');
            
            console.log('Submitting test form...');
            result.innerHTML = 'Submitting...';
            
            try {
                const response = await fetch('/api/community/posts', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: formData,
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);
                
                result.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            } catch (error) {
                console.error('Error:', error);
                result.innerHTML = `Error: ${error.message}`;
            }
        });
    </script>
</body>
</html>