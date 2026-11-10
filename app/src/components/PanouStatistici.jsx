import { useEffect, useState } from 'react'

export default function PanouStatistici() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [prag, setPrag] = useState('3')

  useEffect(() => {
    async function incarca() {
      try {
        const response = await fetch('http://localhost:3001/destinatii')
        if (!response.ok) {
          throw new Error(`Serverul a răspuns cu ${response.status}`)
        }
        const date = await response.json()
        setDestinatii(date)
      } catch (err) {
        setEroare(err.message)
      } finally {
        // Corectura 5: setIncarcare oprit mereu, chiar și la eroare
        setIncarcare(false) 
      }
    }
    incarca()
  }, [])

  if (incarcare) {
    return <p className="stare">Se încarcă statisticile...</p>
  }
  if (eroare) {
    return <p className="stare eroare">Statistici indisponibile: {eroare}</p>
  }

  // Corectura 3: >= în loc de > pentru a include și destinațiile cu exact atâtea zile
  const filtrate = destinatii.filter((d) => d.zile >= Number(prag))
  
  // Corectura 1: filtrate.reduce în loc de destinatii.reduce
  const totalzile = filtrate.reduce((suma, d) => suma + d.zile, 0)
  
  const medie = filtrate.length === 0 ? 0 : totalzile / filtrate.length

  return (
    <section className="panou">
      <h2>Statistici</h2>
      <label>
        Cel puțin{' '}
        <input
          type="number"
          value={prag}
          // Corectura 4: e.target.value ca să citească string-ul din câmp
          onChange={(e) => setPrag(e.target.value)}
        />{' '}
        zile
      </label>
      
      {/* Corectura 2: === 0 pentru verificare booleană corectă */}
      {filtrate.length === 0 && (
        <p className="gol">Nicio destinație cu cel puțin {prag} zile.</p>
      )}

      {filtrate.length > 0 && (
        <ul>
          <li>Destinații: {filtrate.length}</li>
          <li>Total zile: {totalzile}</li>
          <li>Media: {medie.toFixed(1)} zile</li>
        </ul>
      )}
    </section>
  )
}