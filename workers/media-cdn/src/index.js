/**
 * FRS Media CDN Worker
 *
 * Serves images from R2 and handles authenticated uploads from WordPress.
 * Deploy to media.myhub21.com custom domain.
 *
 * Routes:
 *   GET  /headshots/{filename}  - Public image serving
 *   POST /upload                - Authenticated upload (API key required)
 *   DELETE /headshots/{filename} - Authenticated delete (API key required)
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS headers for allowed origins
		const origin = request.headers.get('Origin') || '';
		const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',');
		const corsOrigin = allowedOrigins.includes(origin) ? origin : '';

		const corsHeaders = {
			'Access-Control-Allow-Origin': corsOrigin,
			'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-Filename',
		};

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		try {
			// POST /upload - Authenticated image upload
			if (request.method === 'POST' && path === '/upload') {
				return await handleUpload(request, env, corsHeaders);
			}

			// DELETE /headshots/* - Authenticated delete
			if (request.method === 'DELETE' && path.startsWith('/headshots/')) {
				return await handleDelete(request, env, path, corsHeaders);
			}

			// GET /headshots/* - Public image serving
			if (request.method === 'GET' && path.startsWith('/headshots/')) {
				return await handleGet(env, path, corsHeaders);
			}

			return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
		} catch (err) {
			return jsonResponse({ error: 'Internal error' }, 500, corsHeaders);
		}
	},
};

/**
 * Serve an image from R2.
 */
async function handleGet(env, path, corsHeaders) {
	// Remove leading slash for R2 key
	const key = path.slice(1);

	const object = await env.MEDIA_BUCKET.get(key);
	if (!object) {
		return jsonResponse({ error: 'Image not found' }, 404, corsHeaders);
	}

	const headers = new Headers(corsHeaders);
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('Cache-Control', 'public, max-age=31536000, immutable');

	return new Response(object.body, { headers });
}

/**
 * Handle authenticated image upload.
 *
 * Expects multipart form data with:
 *   - file: the image file
 *   - key: R2 object key (e.g., "headshots/john-doe-1234567.jpg")
 *
 * Or raw body with X-Filename header.
 */
async function handleUpload(request, env, corsHeaders) {
	// Verify API key
	const apiKey = request.headers.get('X-API-Key');
	if (!apiKey || apiKey !== env.UPLOAD_API_KEY) {
		return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
	}

	const contentType = request.headers.get('Content-Type') || '';
	let fileData, objectKey, mimeType;

	if (contentType.includes('multipart/form-data')) {
		// Multipart upload
		const formData = await request.formData();
		const file = formData.get('file');
		objectKey = formData.get('key');

		if (!file || !objectKey) {
			return jsonResponse({ error: 'Missing file or key' }, 400, corsHeaders);
		}

		fileData = await file.arrayBuffer();
		mimeType = file.type || 'image/jpeg';
	} else {
		// Raw binary upload with X-Filename header
		objectKey = request.headers.get('X-Filename');
		if (!objectKey) {
			return jsonResponse({ error: 'Missing X-Filename header' }, 400, corsHeaders);
		}
		fileData = await request.arrayBuffer();
		mimeType = contentType || 'image/jpeg';
	}

	// Validate key starts with headshots/
	if (!objectKey.startsWith('headshots/')) {
		return jsonResponse({ error: 'Key must start with headshots/' }, 400, corsHeaders);
	}

	// Validate file size (max 10MB)
	if (fileData.byteLength > 10 * 1024 * 1024) {
		return jsonResponse({ error: 'File too large (max 10MB)' }, 400, corsHeaders);
	}

	// Upload to R2
	await env.MEDIA_BUCKET.put(objectKey, fileData, {
		httpMetadata: {
			contentType: mimeType,
		},
		customMetadata: {
			uploadedAt: new Date().toISOString(),
			source: 'wordpress',
		},
	});

	// Build public URL
	const publicUrl = `https://media.myhub21.com/${objectKey}`;

	return jsonResponse(
		{
			success: true,
			key: objectKey,
			url: publicUrl,
		},
		200,
		corsHeaders,
	);
}

/**
 * Handle authenticated image delete.
 */
async function handleDelete(request, env, path, corsHeaders) {
	const apiKey = request.headers.get('X-API-Key');
	if (!apiKey || apiKey !== env.UPLOAD_API_KEY) {
		return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
	}

	const key = path.slice(1);
	await env.MEDIA_BUCKET.delete(key);

	return jsonResponse({ success: true, deleted: key }, 200, corsHeaders);
}

/**
 * JSON response helper.
 */
function jsonResponse(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...extraHeaders,
		},
	});
}
