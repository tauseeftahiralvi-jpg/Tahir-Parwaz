export interface Video {
  id: string;
  youtubeId: string; // The actual YouTube video ID
  title: string;
  description: string;
  publishDate: string;
  views: string;
}

export interface EmotionalMetric {
  label: string;
  percentage: number;
  color: string; // hex code
}

export interface GeneratedArticle {
  title: string;
  englishContent: string; // Markdown
  urduContent: string; // Markdown/Text in Urdu script
  emotionalSpectrum: EmotionalMetric[];
  tags: string[];
}

export type ViewState = 'GALLERY' | 'ARTICLE';