import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dine at Home',
    short_name: 'DatHome',
    description: 'Authentic social dining experiences with local hosts in Iceland.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff5745',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
