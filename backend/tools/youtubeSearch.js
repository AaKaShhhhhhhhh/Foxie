/**
 * YouTube Search Tool
 * 
 * Placeholder implementation - returns a search-based embed URL
 */

/**
 * Convert a YouTube watch URL or video ID to an embed URL
 * @param {string} urlOrId - YouTube URL or video ID
 * @returns {string} - Embed URL
 */
function toEmbedUrl(urlOrId) {
  if (!urlOrId) return null;
  
  // Already an embed URL
  if (urlOrId.includes('/embed/')) return urlOrId;
  
  try {
    // If it's a full URL
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const parsed = new URL(urlOrId);
      
      // youtube.com/watch?v=VIDEO_ID
      if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
        return `https://www.youtube-nocookie.com/embed/${parsed.searchParams.get('v')}`;
      }
      
      // youtu.be/VIDEO_ID
      if (parsed.hostname === 'youtu.be') {
        const videoId = parsed.pathname.slice(1);
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }
    
    // Assume it's just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
      return `https://www.youtube-nocookie.com/embed/${urlOrId}`;
    }
    
    return urlOrId;
  } catch {
    // If it looks like just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
      return `https://www.youtube-nocookie.com/embed/${urlOrId}`;
    }
    return null;
  }
}

/**
 * Search for a YouTube video and return embed info
 * @param {string} query - Search query
 * @returns {Promise<{videoId: string, title: string, embedUrl: string}>}
 */
export async function youtubeSearch(query) {
  console.log('youtubeSearch called with query:', query);
  
  // Placeholder implementation
  // TODO: Replace with YouTube Data API
  // const API_KEY = process.env.YOUTUBE_API_KEY;
  // const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`);
  // const data = await response.json();
  // const video = data.items[0];
  // return { videoId: video.id.videoId, title: video.snippet.title, embedUrl: toEmbedUrl(video.id.videoId) };

  // For now, return a search-based embed URL (YouTube's search embed feature)
  // This will show YouTube's search results for the query
  const searchQuery = encodeURIComponent(query);
  
  return {
    videoId: null,
    title: `YouTube search: ${query}`,
    embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}`,
    note: 'This is a placeholder using YouTube search embed. Configure YOUTUBE_API_KEY for direct video results.'
  };
}

export { toEmbedUrl };
export default { youtubeSearch, toEmbedUrl };
