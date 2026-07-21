import { useState } from 'react'
import './App.css'
import VehicleList from './components/VehicleList/VehicleList'
import VehiclePage from './components/VehiclePage/VehiclePage'

function App() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState({ name: 'list', id: null })

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="container">
          <h1 className="brand">Віртуальний автосалон</h1>
          <div className="search">
            <label htmlFor="q" className="visually-hidden">Пошук</label>
            <input
              id="q"
              placeholder="Пошук автомобілів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container main">
        {view.name === 'list' && (
          <>
            <section className="showroom-intro">
              <div>
                <p className="eyebrow">Преміум колекція</p>
                <h2>Автомобілі, які поєднують динаміку та розкіш.</h2>
                <p>Оберіть модель, що відповідає вашому стилю та ритму життя.</p>
              </div>
              <div className="intro-badges">
                <span>Тест-драйв</span>
                <span>Лімітовані моделі</span>
              </div>
            </section>

            <VehicleList
              search={search}
              onOpen={(id) => setView({ name: 'vehicle', id })}
            />
          </>
        )}

        {view.name === 'vehicle' && (
          <VehiclePage id={view.id} onBack={() => setView({ name: 'list', id: null })} />
        )}
      </main>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} Віртуальний автосалон</div>
      </footer>
    </div>
  )
}

export default App
