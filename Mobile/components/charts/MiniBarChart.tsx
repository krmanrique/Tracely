import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Font, Radius } from '../../constants/theme';
import { attColor } from '../../utils/helpers';

interface Bar { month: string; rate: number }
interface Props { data: Bar[]; height?: number }

export default function MiniBarChart({ data, height = 64 }: Props) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.rate), 100);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height }}>
        {data.map((d) => (
          <View key={d.month} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <View
              style={{
                width: '100%',
                height: `${(d.rate / max) * 100}%`,
                backgroundColor: attColor(d.rate),
                borderRadius: Radius.sm,
                opacity: 0.85,
              }}
            />
          </View>
        ))}
      </View>
      {/* Month labels */}
      <View style={{ flexDirection: 'row', marginTop: 6, gap: 6 }}>
        {data.map((d) => (
          <View key={d.month} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: Font.xs, color: Colors.text3 }}>{d.month}</Text>
            <Text style={{ fontSize: Font.xs, color: attColor(d.rate), fontWeight: '600' }}>{d.rate}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
