// DNA Soul Certificate Experience - User View Only
export { default as DNASoulProvider, useDNASoul } from './DNASoulProvider';
export { default as DNASoulRepository } from './DNASoulRepository';
export { default as DNAHelixVisualization } from './DNAHelixVisualization';
export { default as SoulCertificateCard } from './SoulCertificateCard';
export { default as SoulStatusIndicator } from './SoulStatusIndicator';
export { default as MysticalBackground } from './MysticalBackground';
export { default as SoulPortal } from './SoulPortal';
export { default as SoulCertificateView } from './SoulCertificateView';

// Animation stages for DNA Soul experience
export const SOUL_STAGES = {
  PORTAL_OPENING: 'portal_opening',
  DNA_SCANNING: 'dna_scanning',
  SOUL_REVEAL: 'soul_reveal',
  REPOSITORY_ACTIVE: 'repository_active',
  SOUL_READING: 'soul_reading',
  PORTAL_CLOSING: 'portal_closing'
};

// Soul status types
export const SOUL_STATUS = {
  VERIFIED: 'verified',      // Golden DNA - Soul Verified
  PENDING: 'pending',        // Blue DNA - Soul Awakening  
  REVOKED: 'revoked',        // Faded DNA - Soul Fragment Lost
  BURNED: 'burned'          // Dark DNA - Soul Extinguished
};
