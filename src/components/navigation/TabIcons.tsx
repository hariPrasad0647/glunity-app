import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

export const HomeIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4.5 10.5L12 3.5L19.5 10.5" />
    <Path d="M5.5 10.5V20.5C5.5 21.0523 5.94772 21.5 6.5 21.5H17.5C18.0523 21.5 18.5 21.0523 18.5 20.5V10.5" />
    <Path d="M9 21.5V13.5C9 12.6716 9.67157 12 10.5 12H13.5C14.3284 12 15 12.6716 15 13.5V21.5" />
  </Svg>
);

export const WalletIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="6" width="20" height="13" rx="3" />
    <Path d="M15 10C13.8954 10 13 10.8954 13 12.5C13 14.1046 13.8954 15 15 15H22V10H15Z" />
    <Circle cx="17.5" cy="12.5" r="1.5" fill={color} />
  </Svg>
);

export const ResearchIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="10" cy="10" r="7.5" />
    <Line x1="21" y1="21" x2="15.3" y2="15.3" />
    <Line x1="8" y1="6" x2="8" y2="13" />
    <Rect x="7" y="8" width="2" height="3" rx="0.5" />
    <Line x1="12" y1="8" x2="12" y2="14" />
    <Rect x="11" y="9.5" width="2" height="3" rx="0.5" />
  </Svg>
);

export const LaunchpadIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 4 Q13 5 7.5 13.5 L10.5 16.5 Q19 11 20 4 Z" />
    <Circle cx="14.5" cy="9.5" r="1.5" />
    <Path d="M11 9 L4.5 10.5 L7.5 13.5" />
    <Path d="M15 13 L13.5 19.5 L10.5 16.5" />
    <Path d="M8 14 L5 19 L10 16" />
  </Svg>
);

export const DaoIcon = ({ color, size }: { color: string, size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="5.5" r="3.5" />
    <Circle cx="18.5" cy="17.5" r="3.5" />
    <Circle cx="5.5" cy="17.5" r="3.5" />
    {/* Line from top to bottom right */}
    <Line x1="13.5" y1="8.5" x2="17" y2="14.5" />
    {/* Line from top to bottom left */}
    <Line x1="10.5" y1="8.5" x2="7" y2="14.5" />
    {/* Line from bottom left to bottom right */}
    <Line x1="9" y1="17.5" x2="15" y2="17.5" />
    {/* Inner dot */}
    <Circle cx="12" cy="5.5" r="1" fill={color} />
    <Circle cx="18.5" cy="17.5" r="1" fill={color} />
    <Circle cx="5.5" cy="17.5" r="1" fill={color} />
  </Svg>
);
