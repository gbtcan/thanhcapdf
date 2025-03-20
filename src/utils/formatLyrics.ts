import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Utilities for formatting and displaying hymn lyrics
 */

/**
 * Format hymn lyrics for display by replacing line breaks with <br> tags
 * and adding styling to various parts like chorus and verse numbers
 */
export function formatLyrics(lyrics: string): string {
  if (!lyrics) return '';
  
  // Replace line breaks with <br> tags
  return lyrics
    .replace(/\n/g, '<br>')
    // Bold verse numbers (e.g., "1.", "2.", etc. at beginning of line)
    .replace(/(^\d+\.|\n\d+\.)/g, '<strong>$&</strong>');
}

/**
 * Parse and format chorus sections in lyrics
 */
export function parseChorusSections(lyrics: string): string {
  if (!lyrics) return '';
  
  // Replace chorus markers with styled elements
  let formattedLyrics = lyrics
    // First handle standard chorus format
    .replace(
      /(Chorus|CHORUS|Refrain|REFRAIN)(\s*:)/g,
      '<h4 class="font-bold text-indigo-700 dark:text-indigo-400 mt-4 mb-2">$1$2</h4>'
    )
    // Handle verses with numbers
    .replace(
      /^(\d+\.)(.*)/gm,
      '<p class="mb-4"><strong class="text-gray-700 dark:text-gray-300">$1</strong>$2</p>'
    )
    // Replace double line breaks with paragraph breaks
    .replace(/\n\s*\n/g, '</p><p class="mb-4">')
    // Replace single line breaks with <br>
    .replace(/\n/g, '<br>');
  
  // Wrap in a paragraph if not already
  if (!formattedLyrics.startsWith('<p')) {
    formattedLyrics = '<p class="mb-4">' + formattedLyrics;
  }
  if (!formattedLyrics.endsWith('</p>')) {
    formattedLyrics += '</p>';
  }
  
  return formattedLyrics;
}

/**
 * Extract a short summary or preview of lyrics for display in cards or previews
 */
export function extractLyricSummary(lyrics: string, maxLength = 150): string {
  if (!lyrics) return '';
  
  // Get first verse or first few lines
  const firstVerse = lyrics.split(/\n\s*\n/)[0] || lyrics;
  
  // Clean up any markup or special formatting
  const cleanText = firstVerse.replace(/^\d+\.\s*/g, '').trim();
  
  // Limit length
  if (cleanText.length > maxLength) {
    return cleanText.substring(0, maxLength).trim() + '...';
  }
  
  return cleanText;
}

/**
 * Check if lyrics has a chorus section
 */
export function hasChorus(lyrics: string): boolean {
  return /chorus|refrain/i.test(lyrics);
}

/**
 * Format sheet music notation if present in lyrics
 * This handles some common notation formats used in hymn books
 */
export function formatNotation(lyrics: string): string {
  if (!lyrics) return '';
  
  // Replace notation markers with styled spans
  return lyrics.replace(
    /\[(.*?)\]/g, 
    '<span class="text-gray-500 dark:text-gray-400 font-italic text-sm">[$1]</span>'
  );
}

/**
 * Extracts the first verse or a summary from lyrics
 * @param lyrics - Full lyrics text
 * @param maxLength - Maximum length for the summary
 * @returns Short excerpt from the lyrics
 */
export function extractLyricsSummary(lyrics: string, maxLength = 150): string {
  if (!lyrics) return '';
  
  // Get first verse or first few lines
  let summary = lyrics.split(/\n\s*\n/)[0] || lyrics;
  
  // Limit length
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength).trim() + '...';
  }
  
  return summary;
}

/**
 * Analyzes lyrics to identify the language
 * @param lyrics - Lyrics text to analyze
 * @returns Language code (e.g. 'en', 'es', 'la')
 */
export function detectLyricsLanguage(lyrics: string): string {
  if (!lyrics || lyrics.length < 10) return 'unknown';
  
  // Simple heuristic based on common words
  const latinWords = ['sanctus', 'dominus', 'deus', 'gloria', 'sancta', 'amen', 'alleluia'];
  const spanishWords = ['señor', 'dios', 'gracias', 'madre', 'corazón', 'santo', 'cielo'];
  
  const lowerLyrics = lyrics.toLowerCase();
  
  let latinScore = 0;
  let spanishScore = 0;
  let englishScore = 0;
  
  // Check for Latin words
  latinWords.forEach(word => {
    if (lowerLyrics.includes(word)) latinScore += 1;
  });
  
  // Check for Spanish words
  spanishWords.forEach(word => {
    if (lowerLyrics.includes(word)) spanishScore += 1;
  });
  
  // Simple English detection - count common English articles and prepositions
  const englishWords = ['the', 'and', 'lord', 'god', 'praise', 'holy', 'glory'];
  englishWords.forEach(word => {
    if (lowerLyrics.includes(' ' + word + ' ')) englishScore += 1;
  });
  
  // Return detected language based on highest score
  if (latinScore > spanishScore && latinScore > englishScore) {
    return 'la'; // Latin
  } else if (spanishScore > englishScore) {
    return 'es'; // Spanish
  } else {
    return 'en'; // Default to English
  }
}

/**
 * Extract a short excerpt from the lyrics
 * @param lyrics Full lyrics text
 * @param maxLength Maximum excerpt length
 * @returns Short excerpt suitable for previews
 */
export function getLyricsExcerpt(lyrics: string, maxLength: number = 150): string {
  if (!lyrics) return '';
  
  // Remove section markers and trim whitespace
  const cleanLyrics = lyrics
    .replace(/\[(chorus|verse\s*\d*|bridge)\]/gi, '')
    .replace(/chorus:|verse\s*\d*:|bridge:/gi, '')
    .replace(/\n{2,}/g, ' ');
  
  // Get first few lines
  const excerpt = cleanLyrics.substring(0, maxLength);
  
  // Add ellipsis if truncated
  return excerpt.length < lyrics.length ? excerpt + '...' : excerpt;
}

/**
 * Count verses in the lyrics
 * @param lyrics Full lyrics text
 * @returns Number of verses detected
 */
export function countVerses(lyrics: string): number {
  if (!lyrics) return 0;
  
  // Count verse markers and numeric verse indicators (e.g., "1.")
  const verseMarkers = (lyrics.match(/\[verse\s*\d*\]/gi) || []).length;
  
  // If no verse markers, try to count numeric verse indicators
  if (verseMarkers === 0) {
    const numberedVerses = (lyrics.match(/^(\d+)\.\s/gm) || []).length;
    return numberedVerses > 0 ? numberedVerses : 1; // At least one verse
  }
  
  return verseMarkers;
}

/**
 * Checks if lyrics contain a chorus section
 * @param lyrics Full lyrics text
 * @returns Boolean indicating if chorus is present
 */
export function hasChorus(lyrics: string): boolean {
  if (!lyrics) return false;
  
  return /\[chorus\]|chorus:/i.test(lyrics);
}

/**
 * Cleans raw lyrics text by normalizing line breaks and removing excessive whitespace
 * @param rawLyrics Raw lyrics text that might have inconsistent formatting
 * @returns Cleaned lyrics with consistent formatting
 */
export function cleanLyrics(rawLyrics: string): string {
  if (!rawLyrics) return '';
  
  return rawLyrics
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Replace multiple consecutive blank lines with just one
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Trim overall whitespace
    .trim();
}

/**
 * Format lyrics for print view
 * @param lyrics Full lyrics text
 * @returns Formatted HTML suitable for printing
 */
export function formatLyricsForPrint(lyrics: string): string {
  if (!lyrics) return '';
  
  const formatted = parseChorusSections(lyrics);
  
  // Add print-specific styles
  return formatted
    .replace(/<div class="chorus/g, '<div class="print-chorus chorus')
    .replace(/<div class="verse/g, '<div class="print-verse verse')
    .replace(/<div class="bridge/g, '<div class="print-bridge bridge');
}

/**
 * Utility functions for formatting hymn lyrics
 */

/**
 * Detects structural elements like verses and choruses and formats them
 * @param lyrics - Raw lyrics text
 * @returns Formatted HTML string with verse and chorus elements
 */
export function formatLyricsHtml(lyrics: string): string {
  if (!lyrics) return '';
  
  // Split lyrics into paragraphs
  const paragraphs = lyrics.split(/\n\s*\n/);
  
  // Process each paragraph
  const processedParagraphs = paragraphs.map(paragraph => {
    paragraph = paragraph.trim();
    
    // Skip empty paragraphs
    if (!paragraph) return '';
    
    // Detect chorus
    if (/^(chorus|refrain):/i.test(paragraph)) {
      return `<div class="chorus">${paragraph.replace(/^(chorus|refrain):/i, '').trim()}</div>`;
    }
    
    // Detect verse
    if (/^verse\s*\d+:/i.test(paragraph)) {
      return `<div class="verse">${paragraph}</div>`;
    }
    
    // Detect numbered verse (just a number followed by dot)
    if (/^\d+\.\s/.test(paragraph)) {
      return `<div class="verse">${paragraph}</div>`;
    }
    
    // Regular paragraph
    return `<p>${paragraph}</p>`;
  });
  
  // Join paragraphs and replace newlines with <br> in each paragraph
  return processedParagraphs
    .filter(p => p !== '')
    .join('')
    .replace(/\n/g, '<br>');
}

/**
 * Process lyrics to identify and format verses, choruses, etc.
 * @param lyrics - Raw lyrics text
 * @returns An array of structured lyrics sections
 */
export function processLyricsStructure(lyrics: string): Array<{
  type: 'verse' | 'chorus' | 'bridge' | 'other';
  content: string;
  number?: number;
}> {
  if (!lyrics) return [];
  
  // Split lyrics into paragraphs
  const paragraphs = lyrics.split(/\n\s*\n/);
  const sections = [];
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    
    // Detect chorus/refrain
    if (/^(chorus|refrain):/i.test(trimmed)) {
      sections.push({
        type: 'chorus',
        content: trimmed.replace(/^(chorus|refrain):/i, '').trim()
      });
      continue;
    }
    
    // Detect verse with number
    const verseMatch = trimmed.match(/^verse\s*(\d+):/i);
    if (verseMatch) {
      sections.push({
        type: 'verse',
        number: parseInt(verseMatch[1]),
        content: trimmed.replace(/^verse\s*\d+:/i, '').trim()
      });
      continue;
    }
    
    // Detect numbered verse (just a number followed by dot)
    const numberedVerseMatch = trimmed.match(/^(\d+)\.\s/);
    if (numberedVerseMatch) {
      sections.push({
        type: 'verse',
        number: parseInt(numberedVerseMatch[1]),
        content: trimmed
      });
      continue;
    }
    
    // Detect bridge
    if (/^bridge:/i.test(trimmed)) {
      sections.push({
        type: 'bridge',
        content: trimmed.replace(/^bridge:/i, '').trim()
      });
      continue;
    }
    
    // Regular section
    sections.push({
      type: 'other',
      content: trimmed
    });
  }
  
  return sections;
}

/**
 * Extract lyrics sections of a specific type
 * @param lyrics - Raw lyrics 
 * @param type - Section type to extract
 * @returns Array of extracted sections
 */
export function extractLyricsSections(
  lyrics: string, 
  type: 'verse' | 'chorus' | 'bridge' | 'other'
): string[] {
  const sections = processLyricsStructure(lyrics);
  return sections
    .filter(section => section.type === type)
    .map(section => section.content);
}

/**
 * Remove any HTML tags from lyrics for plain text display
 * @param lyrics - Lyrics text that may contain HTML
 * @returns Plain text lyrics
 */
export function stripHtmlFromLyrics(lyrics: string): string {
  if (!lyrics) return '';
  return lyrics.replace(/<[^>]*>?/gm, '');
}
