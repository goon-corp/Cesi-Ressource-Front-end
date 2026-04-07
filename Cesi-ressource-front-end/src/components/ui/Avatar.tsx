
interface AvatarProps {
  name: string;
  size?: number;
  imageUri?: string;
  backgroundColor?: string;
  textColor?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  size = 40,
  imageUri,
  backgroundColor = '#000091',
  textColor = '#FFFFFF',
}: AvatarProps) {
  const fontSize = Math.floor(size * 0.38);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {imageUri ? (
        <img
          src={imageUri}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span
          style={{
            color: textColor,
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
