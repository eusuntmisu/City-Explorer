import { useEffect, useState } from 'react'
import { getDestinatii, postDestinatie, patchVizitat } from './api/destinatii.js'
import { getNevizitate, totalZile } from './utils/destinatii.js'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import Rezumat from './components/Rezumat.jsx'
import Cautare from './components/Cautare.jsx'
import './App.css'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [seTrimite, setSeTrimite] = useState(false)
  const [cautare, setCautare] = useState('')

  // Ex. 1b: initial load, empty dependency list -> runs once per mount
  useEffect(() => {
    async function incarca() {
      try {
        const date = await getDestinatii()
        setDestinatii(date)
      } catch (error) {
        setEroare(error.message)
      } finally {
        setIncarcare(false)
      }
    }

    incarca()
  }, [])

  // Ex. 1c: PATCH first, then replace with the object returned by the server
  async function handleToggle(id) {
    const destinatie = destinatii.find((d) => d.id === id)

    try {
      const salvata = await patchVizitat(id, !destinatie.vizitat)
      setDestinatii((curent) => curent.map((d) => (d.id === id ? salvata : d)))
    } catch (error) {
      setEroare(error.message)
    }
  }

  // Ex. 2c: returns true on success so the form knows when to clear itself
  async function handleAdd(destinatie) {
    setSeTrimite(true)

    try {
      const salvata = await postDestinatie(destinatie)
      setDestinatii((curent) => [...curent, salvata])
      return true
    } catch (error) {
      setEroare(error.message)
      return false
    } finally {
      setSeTrimite(false)
    }
  }

  if (incarcare) {
    return (
      <main>
        <h1>City Explorer</h1>
        <p className="stare">Se încarcă destinațiile...</p>
      </main>
    )
  }

  if (eroare) {
    return (
      <main>
        <h1>City Explorer</h1>
        <p className="stare eroare">Nu am putut încărca datele: {eroare}</p>
      </main>
    )
  }

  // Ex. 3b: only the displayed list is filtered; the summary uses the full state
  const text = cautare.trim().toLowerCase()
  const afisate = destinatii.filter(
    (d) => d.oras.toLowerCase().includes(text) ||
      d.tara.toLowerCase().includes(text),
  )
  const nevizitate = getNevizitate(destinatii)

  // Ex. 3c: two different empty states (figure 7), checked in this order
  let continut
  if (destinatii.length === 0) {
    continut = (
      <p className="gol">Nu există nicio destinație. Adaugă prima din formular.</p>
    )
  } else if (afisate.length === 0) {
    continut = <p className="gol">Niciun rezultat pentru „{cautare.trim()}”.</p>
  } else {
    continut = <ListaDestinatii destinatii={afisate} onToggle={handleToggle} />
  }

  return (
    <main>
      <h1>City Explorer</h1>
      <Rezumat
        total={destinatii.length}
        nevizitate={nevizitate.length}
        zile={totalZile(nevizitate)}
      />
      <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
      <Cautare valoare={cautare} onChange={setCautare} />
      {continut}
    </main>
  )
}
