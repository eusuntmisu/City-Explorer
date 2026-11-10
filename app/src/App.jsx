import { useEffect, useState } from 'react'
import { getDestinatii, patchVizitat, postDestinatie } from './api/destinatii.js'
import { getNevizitate, totalZile } from './utils/destinatii.js'
import Rezumat from './components/Rezumat.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import Cautare from './components/Cautare.jsx'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import './App.css'
import PanouStatistici from './components/PanouStatistici.jsx'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [seTrimite, setSeTrimite] = useState(false)
  const [cautare, setCautare] = useState('')

  useEffect(() => {
    async function incarca() {
      try {
        const date = await getDestinatii()
        setDestinatii(date)
      } catch (err) {
        setEroare(err.message)
      } finally {
        setIncarcare(false)
      }
    }
    incarca()
  }, [])

  async function handleToggle(id) {
    const tinta = destinatii.find((d) => d.id === id)
    if (!tinta) return
    try {
      const salvata = await patchVizitat(id, !tinta.vizitat)
      setDestinatii((curent) =>
        curent.map((d) => (d.id === id ? salvata : d))
      )
    } catch (err) {
      alert(`Nu s-a putut actualiza: ${err.message}`)
    }
  }

  async function handleAdd(destinatieNoua) {
    setSeTrimite(true)
    try {
      const salvata = await postDestinatie(destinatieNoua)
      setDestinatii((curent) => [...curent, salvata])
    } catch (err) {
      alert(`Nu s-a putut adăuga: ${err.message}`)
    } finally {
      setSeTrimite(false)
    }
  }

  const nevizitate = getNevizitate(destinatii)
  const textCautare = cautare.trim().toLowerCase()
  const afisate = destinatii.filter(
    (d) =>
      d.oras.toLowerCase().includes(textCautare) ||
      d.tara.toLowerCase().includes(textCautare)
  )

  return (
    <main>
      <h1>City Explorer</h1>
      <PanouStatistici />

      {incarcare && <p className="stare">Se încarcă destinațiile...</p>}
      {eroare && !incarcare && (
        <p className="stare eroare">Nu am putut încărca datele: {eroare}</p>
      )}

      {!incarcare && !eroare && (
        <>
          <Rezumat
            total={destinatii.length}
            nevizitate={nevizitate.length}
            zile={totalZile(nevizitate)}
          />
          <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
          <Cautare valoare={cautare} onChange={setCautare} />

          {destinatii.length === 0 ? (
            <p className="gol">Nu există nicio destinație. Adaugă prima din formular.</p>
          ) : afisate.length === 0 ? (
            <p className="gol">Niciun rezultat pentru „{cautare}".</p>
          ) : (
            <ListaDestinatii destinatii={afisate} onToggle={handleToggle} />
          )}
        </>
      )}
    </main>
  )
}