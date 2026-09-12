import { create } from 'zustand';

interface MediaState {
  isVisible: boolean;
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  variant: 'avatar' | 'post';
  metadata?: any;
  openMedia: (url: string, type?: 'image' | 'video', variant?: 'avatar' | 'post', metadata?: any) => void;
  closeMedia: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  isVisible: false,
  mediaUrl: null,
  mediaType: 'image',
  variant: 'post',
  metadata: undefined,
  openMedia: (url, type = 'image', variant = 'post', metadata) => {
    // Basic auto-detection if type not provided
    let finalType = type;
    if (url.toLowerCase().match(/\.(mp4|mov|mkv|webm)$/)) {
      finalType = 'video';
    }
    set({ isVisible: true, mediaUrl: url, mediaType: finalType, variant, metadata });
  },
  closeMedia: () => set({ isVisible: false, mediaUrl: null, variant: 'post', metadata: undefined }),
}));
