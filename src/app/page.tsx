import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">RESq</h1>
        <p className="text-xl text-gray-600 mb-8">
          Restaurant Queue Management System
        </p>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/login"
              className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}





