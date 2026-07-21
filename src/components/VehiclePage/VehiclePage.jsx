import { useEffect, useState } from 'react'
import './VehiclePage.css'
import { addComment, getVehicle } from '../../api'

function formatDateTime(value) {
	if (!value) return 'недавно'

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value

	return new Intl.DateTimeFormat('uk-UA', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}

export default function VehiclePage({ id, onBack = () => {} }) {
	const [vehicle, setVehicle] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState({ author: '', text: '' })
	const [submitting, setSubmitting] = useState(false)
	const [feedback, setFeedback] = useState('')

	useEffect(() => {
		let active = true
		setLoading(true)
		setError('')

		getVehicle(id)
			.then((data) => {
				if (!active) return
				setVehicle(data)
			})
			.catch((err) => {
				if (!active) return
				setError(err.message || 'Не вдалося завантажити інформацію')
			})
			.finally(() => {
				if (active) setLoading(false)
			})

		return () => {
			active = false
		}
	}, [id])

	const handleSubmit = (event) => {
		event.preventDefault()
		const text = form.text.trim()
		if (!text) {
			setFeedback('Напишіть текст коментаря')
			return
		}

		setSubmitting(true)
		setFeedback('')

		addComment(id, { author: form.author, text })
			.then((comment) => {
				setVehicle((prev) =>
					prev
						? { ...prev, comments: [comment, ...(prev.comments || [])] }
						: prev,
				)
				setForm({ author: '', text: '' })
				setFeedback('Коментар додано')
			})
			.catch((err) => {
				setFeedback(err.message || 'Не вдалося додати коментар')
			})
			.finally(() => {
				setSubmitting(false)
			})
	}

	return (
		<article className="vehicle-page">
			<button className="back" onClick={onBack}>← Повернутись</button>
			{loading ? <p>Завантаження...</p> : null}
			{error ? <p className="error-text">{error}</p> : null}
			{vehicle ? (
				<div className="detail-grid">
					<div className="gallery" aria-hidden="true">
						{vehicle.images?.[0] || vehicle.thumbnail || vehicle.image ? (
							<img src={vehicle.images?.[0] || vehicle.thumbnail || vehicle.image} alt={vehicle.title} />
						) : (
							<span>{vehicle.title}</span>
						)}
					</div>
					<div className="info">
						<h2>{vehicle.title}</h2>
						<p className="price">{vehicle.price}</p>
						<p className="desc">{vehicle.description || 'Опис автомобіля доступний у даних API.'}</p>
						<div className="specs">
							<span className="spec-chip">Бренд: {vehicle.brand || '—'}</span>
							<span className="spec-chip">Категорія: {vehicle.category || '—'}</span>
							<span className="spec-chip">Рейтинг: {vehicle.rating ?? '—'}</span>
							<span className="spec-chip">В наявності: {vehicle.stock ?? '—'}</span>
							{vehicle.discountPercentage ? <span className="spec-chip">Знижка: {vehicle.discountPercentage}%</span> : null}
						</div>

						<section className="comments">
							<h3>Коментарі</h3>
							<ul className="comment-list">
								{[(vehicle.reviews || []).map((review) => ({
									type: 'review',
									id: review.id || `${review.reviewerName || 'review'}-${review.date || 'unknown'}`,
									author: review.reviewerName || 'API Review',
									text: review.comment || review.body || 'Немає тексту',
									createdAt: review.date || 'з API',
									rating: review.rating,
								})), (vehicle.comments || []).map((comment) => ({
									type: 'comment',
									id: comment.id || comment.createdAt,
									author: comment.author || 'Анонім',
									text: comment.text,
									createdAt: comment.createdAt || 'недавно',
								}))].flat().map((item) => (
									<li key={item.id} className="comment">
										<div className="who">
											{item.author}
											<span className="time">• {formatDateTime(item.createdAt)}</span>
											{item.type === 'review' ? <span className="badge">review</span> : null}
										</div>
										{item.rating ? <div className="rating">⭐ {item.rating}</div> : null}
										<div className="text">{item.text}</div>
									</li>
								))}
							</ul>

							<form className="comment-form" onSubmit={handleSubmit}>
								{feedback ? <p className="feedback">{feedback}</p> : null}
								<label>
									Ім'я
									<input maxLength={100} placeholder="Ваше ім'я" value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} />
								</label>
								<label>
									Коментар
									<textarea maxLength={1000} placeholder="Ваш відгук" value={form.text} onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))} />
								</label>
								<div className="form-actions">
									<button type="submit" disabled={submitting}>{submitting ? 'Надсилаю...' : 'Додати коментар'}</button>
								</div>
							</form>
						</section>
					</div>
				</div>
			) : null}
		</article>
	)
}
