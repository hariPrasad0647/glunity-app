import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
  formatter?: (val: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  style, 
  duration = 1500,
  formatter = (val) => val.toLocaleString()
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const initialValue = displayValue;
    const targetValue = value;

    if (initialValue === targetValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quint
      const easeOut = 1 - Math.pow(1 - progress, 5);
      
      const currentVal = initialValue + (targetValue - initialValue) * easeOut;
      setDisplayValue(Math.round(currentVal));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <Text style={style}>{formatter(displayValue)}</Text>;
};
