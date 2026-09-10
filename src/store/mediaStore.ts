import { create } from 'zustand';

interface MediaState {
  isVisible: boolean;
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  variant: 'avatar' | 'post';
  openMedia: (url: string, type?: 'image' | 'video', variant?: 'avatar' | 'post') => void;
  closeMedia: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  isVisible: false,
  mediaUrl: null,
  mediaType: 'image',
  variant: 'post',
  openMedia: (url, type = 'image', variant = 'post') => {
    // Basic auto-detection if type not provided
    let finalType = type;
    if (url.toLowerCase().match(/\.(mp4|mov|mkv|webm)$/)) {
      finalType = 'video';
    }
    set({ isVisible: true, mediaUrl: url, mediaType: finalType, variant });
  },
  closeMedia: () => set({ isVisible: false, mediaUrl: null, variant: 'post' }),
}));
