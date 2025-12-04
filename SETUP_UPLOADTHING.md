# Setting Up Image Upload with UploadThing

The Nilexia marketplace now supports direct image uploads from users' devices using UploadThing.

## Quick Setup (5 minutes)

### 1. Create UploadThing Account

1. Go to https://uploadthing.com
2. Sign up with your GitHub account (it's free)
3. Create a new app for your project

### 2. Get Your API Key

1. In your UploadThing dashboard, go to **API Keys**
2. Copy your **Token** (it starts with `sk_...`)

### 3. Add to Environment Variables

Add this line to your `.env` file:

```bash
UPLOADTHING_TOKEN=sk_your_token_here
```

### 4. Restart Your Dev Server

```bash
npm run dev
```

That's it! Image uploads should now work.

## How It Works

### For Users

1. Go to "Create Listing" page
2. Click "Choose Files" under Images section
3. Select up to 5 images (max 4MB each)
4. Click "Upload Images" button
5. See preview of uploaded images
6. Remove any unwanted images with the × button
7. Fill out other fields and submit

### Technical Details

- **Max File Size**: 4MB per image
- **Max Images**: 5 per listing
- **Accepted Formats**: PNG, JPG, JPEG, GIF
- **Storage**: Hosted on UploadThing CDN
- **URLs**: Permanent and fast to load
- **Security**: Requires authentication to upload

## Free Tier Limits

UploadThing's free tier includes:
- 2GB storage
- 2GB bandwidth per month
- More than enough for a campus marketplace

## Troubleshooting

### "Unauthorized" error when uploading
- Make sure you're logged in
- Check that UPLOADTHING_TOKEN is set in `.env`
- Restart your dev server after adding the token

### Images not uploading
- Check file size (must be under 4MB)
- Check file format (must be image)
- Check browser console for errors

### Need to increase limits?
- UploadThing has paid tiers starting at $20/month
- 100GB storage + 100GB bandwidth

## Alternative: Continue Using URL Paste

If you don't want to set up UploadThing right now, users can still:
1. Upload images to Imgur, Google Drive, or any image host
2. Get the direct image URL
3. We can add a "Paste URL" fallback option

Let me know if you want me to add the URL paste option back as a fallback!
