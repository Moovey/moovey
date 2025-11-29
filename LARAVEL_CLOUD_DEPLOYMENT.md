# Laravel Cloud Deployment Guide

## Storage Configuration

### Required Command After Deployment

After deploying to Laravel Cloud, you **MUST** run the following command to create the storage symlink:

```bash
php artisan storage:link
```

This command creates a symbolic link from `public/storage` to `storage/app/public`, allowing uploaded files (like business logos) to be accessible via HTTP.

### Why This Is Needed

- Business logos are stored in `storage/app/public/business-logos/`
- They need to be accessible via URLs like: `https://your-domain.com/storage/business-logos/filename.png`
- The `storage:link` command creates the necessary symlink for this to work

### Laravel Cloud Deployment Steps

1. Push your code to the repository
2. Laravel Cloud automatically deploys
3. **Run via Laravel Cloud CLI or dashboard:**
   ```bash
   php artisan storage:link
   ```
4. Verify uploaded images are accessible

### Troubleshooting

If you see **404 errors** for uploaded images:
- Check if the symlink exists: `ls -la public/storage`
- Re-run: `php artisan storage:link`
- Verify file permissions in `storage/app/public/`

### Environment Variables

Ensure these are set correctly in Laravel Cloud:
- `APP_URL` - Your production domain (e.g., `https://moovey-main-sc6n2n.laravel.cloud`)
- The system automatically configures the storage URL as: `{APP_URL}/storage`
