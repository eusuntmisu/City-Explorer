// Ex. 3a: controlled search input; the text lives in App's state
export default function Cautare({ valoare, onChange }) {
  return (
    <div className="cautare">
      <input
        type="search"
        placeholder="Caută după oraș sau țară"
        value={valoare}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
