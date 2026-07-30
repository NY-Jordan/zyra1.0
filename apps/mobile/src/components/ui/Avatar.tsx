import { Image, Text, View } from 'react-native';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, uri, size = 40 }: { name: string; uri?: string; size?: number }) {
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={style} />;
  }

  return (
    <View
      style={style}
      className="items-center justify-center bg-emerald-100 dark:bg-emerald-900/40">
      <Text className="font-bold text-emerald-700 dark:text-emerald-400" style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
