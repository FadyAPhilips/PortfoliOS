import { useState } from 'react'
import PixelAvatar from './PixelAvatar'

/**
 * A profile picture, with the generated pixel-art face as the placeholder.
 *
 * `photo` is a path under /public (e.g. "/assets/avatars/me.jpg"). Empty,
 * missing, or broken paths all fall back to PixelAvatar, so the page never
 * shows a torn-image icon while you're still collecting artwork.
 */
export default function Avatar({ name, photo, variant, size = 76 }) {
  const [failed, setFailed] = useState(false)

  if (photo && !failed) {
    return (
      <img
        className="avatar-photo"
        src={photo}
        width={size}
        height={size}
        alt={`${name} profile picture`}
        onError={() => setFailed(true)}
      />
    )
  }

  return <PixelAvatar name={name} variant={variant} size={size} />
}
