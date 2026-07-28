'use client'

import { useEffect, useState } from 'react'
import { TIME_SLOTS, CATEGORIES, API_URL, SUPABASE_ANON_KEY } from '@/lib/constants'

// Supabase Edge Functions require this header on every request, or they
// reject it before your function code even runs.
const authHeaders = {
  Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export default function Home() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [name, setName] = useState('')
  const [date, setDate] = useState(getTodayDate())
  const [timeSlot, setTimeSlot] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [note, setNote] = useState('')

  const [filterDate, setFilterDate] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // Calls the "bookings" Edge Function deployed on Supabase.
  async function loadBookings() {
    setLoading(true)
    const response = await fetch(API_URL + '/bookings', {
      headers: authHeaders,
    })
    const data = await response.json()
    setBookings(data)
    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const bookingsOnSelectedDate = bookings.filter((booking) => booking.date === date)
  const bookedTimeSlots = bookingsOnSelectedDate.map((booking) => booking.time_slot)

  const visibleBookings = bookings.filter((booking) => {
    if (filterDate && booking.date !== filterDate) return false
    if (filterCategory && booking.category !== filterCategory) return false
    return true
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!name || !date || !timeSlot || !category) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    const response = await fetch(API_URL + '/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ name, date, time_slot: timeSlot, category, note }),
    })
    const data = await response.json()

    if (!response.ok) {
      setErrorMessage(data.error)
      return
    }

    setSuccessMessage(`Booked "${timeSlot}" on ${date} for ${name}.`)
    setName('')
    setTimeSlot('')
    setNote('')
    loadBookings()
  }

  async function handleDelete(id) {
    const confirmed = confirm('Delete this booking?')
    if (!confirmed) return

    await fetch(API_URL + '/bookings-delete?id=' + id, {
      method: 'DELETE',
      headers: authHeaders,
    })
    loadBookings()
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Time Slot Booking</h1>
        <p className="text-gray-500 mt-1">Pick a date, choose an available slot, and book it.</p>
      </header>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3">
          {successMessage}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* ---------- BOOKING FORM ---------- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Booking</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setTimeSlot('')
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedTimeSlots.includes(slot)
                  const isSelected = timeSlot === slot

                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setTimeSlot(slot)}
                      className={
                        'text-sm px-3 py-2 rounded-lg border ' +
                        (isBooked
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300')
                      }
                    >
                      {slot} {isBooked ? '(Booked)' : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Short note (optional)"
              />
            </div>

            <button
              type="submit"
              disabled={!timeSlot}
              className="w-full bg-blue-600 text-white font-medium rounded-lg py-2.5 disabled:opacity-50"
            >
              Book Slot
            </button>
          </form>
        </section>

        {/* ---------- BOOKINGS LIST ---------- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Bookings</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
            />
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading bookings...</p>
          ) : visibleBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No bookings found.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {visibleBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between border border-gray-200 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{booking.name}</p>
                    <p className="text-xs text-gray-500">
                      {booking.date} · {booking.time_slot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.category}
                      {booking.note ? ' — ' + booking.note : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="text-xs text-red-500"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
