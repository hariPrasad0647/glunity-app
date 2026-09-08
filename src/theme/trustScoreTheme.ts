export const TRUST_SCORE_TIERS = {
  UNVERIFIED: { min: 0, max: 29, color: '#9CA3AF' }, // neutral gray
  EMERGING: { min: 30, max: 49, color: '#3B82F6' }, // blue
  RESONANT_VOICE: { min: 50, max: 64, color: '#A855F7' }, // purple
  GLUNITY_TRUSTED: { min: 65, max: 74, color: '#10B981' }, // green
  GLUNITY_SENTINEL: { min: 75, max: 89, color: '#F59E0B' }, // orange/gold
  GLUNITY_ELITE: { min: 90, max: 100, color: '#EAB308' }, // premium gold/yellow
} as const;

export const getTierColor = (tierName: string | undefined): string => {
  if (!tierName) return TRUST_SCORE_TIERS.UNVERIFIED.color;

  const normalizedTier = tierName.toUpperCase().replace(/\s+/g, '_');
  
  if (normalizedTier in TRUST_SCORE_TIERS) {
    return TRUST_SCORE_TIERS[normalizedTier as keyof typeof TRUST_SCORE_TIERS].color;
  }
  
  return TRUST_SCORE_TIERS.UNVERIFIED.color;
};
