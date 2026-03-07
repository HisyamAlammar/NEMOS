// Single Source of Truth for UMKM Images
// Consolidates images across UMKM Arena, Dashboard Repayment Tracker, and UMKM Rekomendasi.

export const UMKM_IMAGES = {
    'Kedai Kopi Senja': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80',
    'Tani Makmur Organik': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80',
    'Batik Cempaka': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80',
    'Dapur Nusantara': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80',
    'Warung Maju Bersama': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80',
    'Tenun Karya Nusantara': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80'
};

/**
 * Returns the UMKM image formatted with the correct Unsplash width and height properties.
 * Matches styling conventions used in Kedai Kopi Senja default.
 */
export const getUmkmImage = (name, width, height) => {
    const base = UMKM_IMAGES[name] || UMKM_IMAGES['Kedai Kopi Senja'];
    return `${base}&w=${width}&h=${height}`;
};
