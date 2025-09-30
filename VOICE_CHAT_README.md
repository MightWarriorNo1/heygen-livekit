# Voice Chat Avatar Component

This project has been updated to focus exclusively on voice chat functionality with a full-screen avatar display.

## Features

- **Full-screen avatar display** - The avatar takes up the entire screen
- **Voice chat only** - No text chat or configuration options
- **Cross-platform responsive design** - Works on desktop, tablet, and mobile
- **Configurable avatar and voice** - Pass `avatarId` and `voiceId` as props
- **Clean interface** - Minimal controls overlay at the bottom

## Usage

### Environment Variables

The component automatically reads `avatarId` and `voiceId` from environment variables through a configuration file:

```bash
# .env.local
NEXT_PUBLIC_AVATAR_ID=your_avatar_id_here
NEXT_PUBLIC_VOICE_ID=your_voice_id_here
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
```

### Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual avatar and voice IDs in `.env.local`

3. The component will automatically use these values through the configuration system

### Props

- `avatarId` (optional): The ID of the avatar to use. If not provided, uses the first avatar from the constants.
- `voiceId` (optional): The ID of the voice to use. If not provided, uses the default ElevenLabs model.

### Interface

- **Full-screen avatar video** - The avatar fills the entire screen
- **Voice controls** - Start/stop voice chat and interrupt buttons
- **Connection status** - Shows connection quality in the top-left corner
- **Close button** - Stop the avatar session (top-right corner)

## Responsive Design

The component is optimized for:
- **Desktop** - Full-screen experience with hover effects
- **Tablet** - Touch-optimized controls with proper sizing
- **Mobile** - Touch-friendly interface with appropriate button sizes

## Cross-Platform Support

- **Web browsers** - Chrome, Firefox, Safari, Edge
- **Mobile browsers** - iOS Safari, Chrome Mobile, etc.
- **Touch devices** - Optimized for touch interactions

## Styling

The component uses Tailwind CSS with custom responsive classes:
- Full-screen video with `object-cover` for proper aspect ratio
- Semi-transparent overlays for controls
- Touch-optimized button sizes (44px minimum)
- Backdrop blur effects for modern UI

## Development

To run the development server:

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# HeyGen API Configuration
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com

# Avatar Configuration
NEXT_PUBLIC_AVATAR_ID=your_avatar_id_here

# Voice Configuration  
NEXT_PUBLIC_VOICE_ID=your_voice_id_here
```

### Required Setup

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values**:
   - Replace `your_avatar_id_here` with your actual avatar ID
   - Replace `your_voice_id_here` with your actual voice ID
   - Update the API URL if needed

3. **Configure your access token endpoint** in `/api/get-access-token/route.ts`

### Security Note

- Never commit `.env.local` to version control
- The `.env.example` file is safe to commit as it contains no sensitive data
- Use `NEXT_PUBLIC_` prefix for variables that need to be available in the browser
