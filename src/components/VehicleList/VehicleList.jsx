import { useEffect, useState } from 'react'
import './VehicleList.css'
import { getVehicles } from '../../api'

export default function VehicleList({ search = '', onOpen = () => {} }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    getVehicles({ search, page, perPage: 8 })
      .then((data) => {
        if (!active) return
        setVehicles(data.items || [])
        setTotalPages(data.totalPages || 1)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Не вдалося завантажити автомобілі')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, page])

  return (
    <section className="vehicle-list">
      <div className="list-head">
        <h2>Наявні автомобілі</h2>
        <div className="controls">
          <small className="results">{loading ? 'Завантаження...' : `${vehicles.length} результатів`}</small>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <ul className="cards" aria-live="polite">
        {vehicles.map((v) => {
          const imageUrl = v.images?.[0] || v.thumbnail || v.image || ''

          return (
            <li key={v.id} className="card">
              <div className="media" aria-hidden="true">
                {imageUrl ? <img src={imageUrl} alt={v.title} /> : null}
              </div>
              <div className="meta">
                <h3 className="title">{v.title}</h3>
                <div className="sub">{v.brand || 'Автомобіль'} • {v.category || 'Сегмент'}</div>
                <div className="extra">
                  <span>⭐ {v.rating ?? '—'}</span>
                  <span>Запас: {v.stock ?? '—'}</span>
                </div>
                <div className="sub">{v.price || 'Дізнатись деталі'}</div>
              </div>
              <div className="actions">
                <button onClick={() => onOpen(v.id)} aria-label={`Відкрити ${v.title}`}>Переглянути</button>
              </div>
            </li>
          )
        })}
      </ul>

      {totalPages > 1 ? (
        <nav className="pagination" aria-label="Pagination">
          <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>«</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={pageNumber === page ? 'active' : ''}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>»</button>
        </nav>
      ) : null}
    </section>
  )
}
