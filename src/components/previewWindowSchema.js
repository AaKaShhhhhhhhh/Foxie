import { z } from 'zod';

/**
 * Zod schema for PreviewWindow props
 * Used by Tambo AI to understand how to control this component
 */
export const previewWindowPropsSchema = z.object({
  isOpen: z.boolean()
    .describe('Whether the preview window is visible. Set to true to show the window, false to hide it.'),
  
  title: z.string()
    .optional()
    .describe('Title displayed in the window title bar. Defaults to "Preview".'),
  
  mode: z.enum(['markdown', 'url', 'youtube'])
    .describe('Content display mode. Use "markdown" for explanations/proofs, "youtube" for videos, "url" for web pages.'),
  
  markdown: z.string()
    .optional()
    .describe('Markdown content to render when mode is "markdown". Supports full Markdown syntax.'),
  
  url: z.string()
    .optional()
    .describe('URL to embed when mode is "url" or "youtube". For YouTube, can be a watch URL or video ID.'),
  
  x: z.number()
    .optional()
    .describe('Window X position in pixels from left edge. Leave undefined to use last saved position.'),
  
  y: z.number()
    .optional()
    .describe('Window Y position in pixels from top edge. Leave undefined to use last saved position.'),
  
  width: z.number()
    .optional()
    .describe('Window width in pixels. Defaults to 600.'),
  
  height: z.number()
    .optional()
    .describe('Window height in pixels. Defaults to 400.'),
});

/**
 * Default props for the PreviewWindow
 */
export const previewWindowDefaults = {
  isOpen: false,
  title: 'Preview',
  mode: 'markdown',
  markdown: '',
  url: '',
  width: 600,
  height: 400,
};
