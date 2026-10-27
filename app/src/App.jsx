import { useState } from 'react'
import { destinatii as destinatiiInitiale } from './data/destinatii.js'
import Rezumat from './components/Rezumat.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import './App.css'
import { getNevizitate, totalZile, marcheazaVizitat, adaugaDestinatie, stergeDestinatie } from './utils/destinatii.js'


export default function App() {
  const [destinatii, setDestinatii] = useState(destinatiiInitiale)

  const total = destinatii.length
  const nevizitate = getNevizitate(destinatii).length
  const zile = totalZile(getNevizitate(destinatii))

  function handleToggle(id) {
    setDestinatii((curent) => marcheazaVizitat(curent, id))
  }

  function handleAdd(destinatie) {
    setDestinatii((curent) => adaugaDestinatie(curent, destinatie))
  }

  function handleDelete(id) {
    setDestinatii((curent) => stergeDestinatie(curent, id))
  }

  return (
    <main>
      <h1>City Explorer</h1>
      <Rezumat total={total} nevizitate={nevizitate} zile={zile} />
      <FormularDestinatie onAdd={handleAdd} />
      <ListaDestinatii destinatii={destinatii} onToggle={handleToggle} onDelete={handleDelete} />
    </main>
  )
}