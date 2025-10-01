<!DOCTYPE html>
<html>
<head>
    <title>Test Image Upload</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Test Image Upload</h1>
    <form action="/test-upload" method="POST" enctype="multipart/form-data">
        @csrf
        <input type="file" name="image" accept="image/*" required>
        <button type="submit">Upload Test</button>
    </form>
    
    <script>
        document.querySelector('form').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/test-upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const result = await response.json();
                console.log('Test results:', result);
                alert('Check console for results');
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        };
    </script>
</body>
</html>