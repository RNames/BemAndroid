/**
 * Village Profile Model
 * Mendefinisikan struktur data profil desa (/village_profile/main-village) di Firestore
 */

export interface VillageDemographics {
  area: string;
  households: number;
  population: number;
}

export interface VillageHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface VillageSocialMedia {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface VillageProfile {
  id: string;
  villageName: string;
  description: string;
  imageUrl: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  demographics: VillageDemographics;
  highlights: VillageHighlight[];
  socialMedia: VillageSocialMedia;
  visionMission: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Data default Desa Dlemer jika data Firestore masih kosong/loading
 */
export const DEFAULT_VILLAGE_PROFILE: VillageProfile = {
  id: 'main-village',
  villageName: 'Desa Dlemer',
  description:
    'Desa Dlemer adalah desa yang terletak di Kecamatan Kwanyar, Kabupaten Bangkalan, Pulau Madura, Jawa Timur. Desa ini dikenal dengan kekayaan budaya lokal, kehidupan agraris yang kental, serta keramahan masyarakatnya yang menjunjung tinggi nilai-nilai adat Madura. Mayoritas penduduk bermata pencaharian sebagai petani tegalan, peternak sapi Madura, penjahit, serta pengrajin batik dan kerajinan lokal. Produk unggulan desa meliputi kerupuk udang, petis, batik Madura, dan hasil ternak.',
  imageUrl:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80',
  location: 'Desa Dlemer, Kecamatan Kwanyar, Kabupaten Bangkalan, Madura, Jawa Timur',
  contactEmail: 'desa.dlemer@bangkalankab.go.id',
  contactPhone: '+62 812-3456-7890',
  demographics: {
    area: '246.70 Ha',
    households: 875,
    population: 3250,
  },
  highlights: [
    {
      icon: '🌾',
      title: 'Pertanian Tegalan',
      description:
        'Petani mengelola lahan tegalan seluas ratusan hektar untuk tanaman pangan seperti jagung, kacang tanah, dan singkong — tulang punggung ekonomi desa.',
    },
    {
      icon: '🐄',
      title: 'Peternakan Sapi Madura',
      description:
        'Peternakan sapi Madura khas, kambing, dan unggas menjadi kebanggaan dan sumber pendapatan utama bagi warga desa Dlemer.',
    },
    {
      icon: '🧵',
      title: 'Kerajinan & Batik',
      description:
        'Industri rumahan menjahit pakaian dan batik Madura memberikan lapangan kerja kreatif bagi ibu-ibu dan warga desa.',
    },
    {
      icon: '🏺',
      title: 'Produk Lokal Unggulan',
      description:
        'Kerupuk udang, petis, dan berbagai produk olahan menjadi produk andalan yang dipasarkan hingga ke luar daerah.',
    },
  ],
  socialMedia: {
    facebook: 'https://facebook.com/desa.dlemer',
    instagram: 'https://instagram.com/desa_dlemer',
    whatsapp: 'https://wa.me/6281234567890',
  },
  visionMission:
    'Visi: Mewujudkan Desa Dlemer sebagai desa mandiri, sejahtera, dan berbudaya berbasis kearifan lokal Madura.\n\nMisi:\n1. Mengembangkan potensi pertanian dan peternakan secara berkelanjutan.\n2. Meningkatkan kualitas sumber daya manusia melalui pendidikan dan pelatihan keterampilan.\n3. Melestarikan budaya dan kearifan lokal Madura.\n4. Mendorong ekonomi kreatif berbasis produk unggulan desa.',
  createdAt: 1783351118742,
  updatedAt: 1788985354013,
};
