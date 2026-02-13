
## **Comprehensive Prompt for SubtitleForge - A Next.js SRT File Generator & Video Embedding Application**

---

### **Application Name: SubtitleForge**

### **Project Overview:**
Create a modern, mobile-responsive web application using Next.js 14+ (App Router), Tailwind CSS, and TypeScript that enables users to generate SRT subtitle files with an intuitive template system and embed subtitles into videos directly in the browser using FFmpeg.wasm.

---

### **Core Technologies:**
- **Framework:** Next.js 14+ (App Router with TypeScript)
- **Styling:** Tailwind CSS with shadcn/ui components
- **Video Processing:** @ffmpeg/ffmpeg (ffmpeg.wasm) for browser-based video processing
- **State Management:** React hooks (useState, useReducer) and Context API
- **File Handling:** Browser File API
- **Icons:** Lucide React
- **Responsiveness:** Mobile-first design with Tailwind breakpoints

---

### **Feature Set:**

#### **1. SRT File Generator**

**Template-Based Creation:**
- Pre-built templates for common use cases:
  - Interview/Dialogue (2-line captions, 32 chars max per line)
  - Tutorial/Educational (longer duration, descriptive)
  - Social Media (short, punchy, 1-2 seconds)
  - Movie/Film (standard timing, proper formatting)
  - Custom (user-defined settings)

**Editor Features:**
- Add/remove subtitle entries dynamically
- Each entry should have:
  - Sequence number (auto-generated)
  - Start time (HH:MM:SS,MS format)
  - End time (HH:MM:SS,MS format)
  - Subtitle text (multi-line support)
- Time picker/input with format validation
- Real-time preview of subtitle timing
- Drag-and-drop reordering of entries
- Bulk operations (delete multiple, adjust all timings)
- Character count per line with visual indicator
- Duration calculator showing subtitle display time
- Auto-save to browser localStorage

**SRT Format Specifications:**
```
1
00:00:01,000 --> 00:00:04,000
First subtitle text here

2
00:00:05,000 --> 00:00:08,000
Second subtitle text
Can span multiple lines

3
00:00:09,000 --> 00:00:12,000
Third subtitle with <b>formatting</b>
```

**Export Options:**
- Download as .srt (SubRip format)
- Download as .vtt (WebVTT format)
- Download as .txt (plain text)
- Download as .ass (Advanced SubStation Alpha - optional)
- Copy to clipboard option

---

#### **2. Video & Subtitle Embedding**

**Upload Interface:**
- Drag-and-drop zone for video files
- Support formats: MP4, WebM, AVI, MOV, MKV
- File size limit indicator (warn at 500MB+)
- Upload SRT file or use generated SRT from editor
- Preview both video and subtitle before processing

**Embedding Options:**
- **Hard Subtitles (Burn-in):** Permanently embed subtitles into video
- **Soft Subtitles:** Add as separate track (MP4/MKV)
  
**Hard Subtitle Customization:**
- Font family selection (Arial, Helvetica, Roboto, etc.)
- Font size (adjustable)
- Font color picker
- Background color/transparency
- Border/outline settings
- Position (top, center, bottom)
- Alignment (left, center, right)

**Processing Features:**
- Progress bar with percentage
- Estimated time remaining
- Cancel operation option
- Preview final result before download
- Error handling with clear messages

**FFmpeg.wasm Implementation:**
```typescript
// Hard subtitle burning command
ffmpeg.exec([
  '-i', 'input.mp4',
  '-vf', `subtitles=subtitles.srt:force_style='FontSize=24,FontName=Arial,PrimaryColour=&H00FFFFFF,BackColour=&HA0000000,BorderStyle=4'`,
  '-c:a', 'copy',
  'output.mp4'
]);

// Soft subtitle embedding command
ffmpeg.exec([
  '-i', 'input.mp4',
  '-i', 'subtitles.srt',
  '-c', 'copy',
  '-c:s', 'mov_text',
  '-metadata:s:s:0', 'language=eng',
  'output.mp4'
]);
```

---

#### **3. UI/UX Design Requirements**

**Layout Structure:**
- Top navigation bar with logo and menu
- Tabbed interface:
  - Tab 1: "Create Subtitles"
  - Tab 2: "Embed Subtitles"
  - Tab 3: "Convert Formats"
- Responsive sidebar for templates/presets
- Bottom action bar for save/export/download

**Mobile Responsiveness:**
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly buttons (min 44px tap target)
- Swipeable tabs on mobile
- Bottom sheet modals for mobile forms
- Optimized video player for mobile viewports

**Design Elements:**
- Dark/light mode toggle
- Gradient accents for branding
- Card-based layout for sections
- Toast notifications for actions
- Loading skeletons for async operations
- Empty states with helpful illustrations
- Tooltips for complex features

**Color Scheme (Tailwind):**
```javascript
// Example theme
primary: 'blue-600',
secondary: 'purple-600',
accent: 'pink-500',
background: 'slate-50',
surface: 'white',
text: 'slate-900'
```

---

#### **4. Advanced Features**

**Subtitle Preview:**
- Real-time video player with subtitle overlay
- Scrubber to navigate through video
- Play/pause with subtitle sync verification
- Adjustable playback speed
- Frame-by-frame navigation

**AI-Assisted Features (Optional - Future Enhancement):**
- Auto-generate timestamps from speech
- Suggest subtitle breaks based on natural pauses
- Translation support
- Spell check integration

**Batch Processing:**
- Upload multiple SRT files
- Apply same settings to multiple videos
- Queue management system
- Download as ZIP archive

**Keyboard Shortcuts:**
- Ctrl+S: Save current work
- Ctrl+E: Export subtitles
- Space: Play/pause video preview
- Arrow keys: Navigate between subtitle entries
- Ctrl+Z/Y: Undo/redo

---

#### **5. Technical Implementation Details**

**File Structure:**
```
/app
  /layout.tsx
  /page.tsx
  /create
    /page.tsx
  /embed
    /page.tsx
  /convert
    /page.tsx
/components
  /subtitle-editor
    /SubtitleEntry.tsx
    /SubtitleList.tsx
    /TimeInput.tsx
    /TemplateSelector.tsx
  /video-processor
    /VideoUpload.tsx
    /FFmpegProcessor.tsx
    /StyleCustomizer.tsx
    /ProgressBar.tsx
  /ui (shadcn components)
/lib
  /ffmpeg-utils.ts
  /subtitle-parser.ts
  /file-converter.ts
/types
  /subtitle.types.ts
```

**Key Type Definitions:**
```typescript
interface SubtitleEntry {
  id: string;
  sequenceNumber: number;
  startTime: string; // "00:00:01,000"
  endTime: string;   // "00:00:04,000"
  text: string;
}

interface SRTFile {
  entries: SubtitleEntry[];
  metadata?: {
    title?: string;
    language?: string;
    createdAt: Date;
  };
}

interface VideoProcessingOptions {
  subtitleType: 'hard' | 'soft';
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  backgroundColor?: string;
  position?: 'top' | 'center' | 'bottom';
}
```

**FFmpeg.wasm Setup:**
```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const loadFFmpeg = async () => {
  const ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};
```

**Performance Optimizations:**
- Lazy load FFmpeg.wasm only when needed
- Use Web Workers for heavy processing
- Implement virtual scrolling for large subtitle lists
- Debounce auto-save operations
- Compress video preview for faster loading
- IndexedDB for persistent storage of large projects

---

#### **6. Error Handling & Validation**

**Input Validation:**
- Time format validation (HH:MM:SS,MS)
- Ensure end time > start time
- Check for overlapping subtitles (with warning)
- File size limits with clear error messages
- Supported format checking
- Character encoding validation (UTF-8)

**Error Messages:**
- User-friendly error descriptions
- Suggested solutions
- Retry mechanisms for failed operations
- Fallback options when FFmpeg fails

---

#### **7. Accessibility Features**

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements for operations
- High contrast mode support
- Focus indicators
- Skip to content links

---

#### **8. Documentation & Help**

- Inline tooltips explaining features
- "How to" modal with video tutorials
- SRT format guide
- FAQ section
- Keyboard shortcuts reference
- Export format comparison guide

---

### **Deliverables:**

1. **Fully functional Next.js application** with all features implemented
2. **Mobile-responsive design** tested on common devices
3. **Clean, commented code** following React/Next.js best practices
4. **Type-safe implementation** with TypeScript
5. **Error handling** throughout the application
6. **Performance optimized** for smooth user experience
7. **README.md** with setup instructions
8. **Example SRT templates** included

---

### **Success Criteria:**

- ✅ Users can create SRT files from scratch or templates
- ✅ Real-time preview of subtitles synced with video
- ✅ Export to multiple subtitle formats (.srt, .vtt, .txt)
- ✅ Embed subtitles into videos (hard/soft) using FFmpeg.wasm
- ✅ Fully responsive on mobile, tablet, and desktop
- ✅ Fast performance even with large video files
- ✅ Intuitive UI requiring no tutorial for basic use
- ✅ Works offline after initial load (PWA optional)
