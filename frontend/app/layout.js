import './globals.css'

export const metadata = {
  title: 'Time Slot Booking',
  description: 'Book an available time slot',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
