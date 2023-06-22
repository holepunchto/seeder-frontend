import { readFile } from 'fs/promises'
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import SeedBee from 'seedbee'

function AddBee (props) {
  const [name, setName] = useState(null)
  const [entries, setEntries] = useState([])
  const [path, setPath] = useState(null)

  const addEntries = async (store, name, entries) => {
    const core = store.get({ name })
    const bee = new SeedBee(core)
    await core.ready()
    await bee.ready()
    await Promise.all(entries.map(e => bee.put(e.key, { description: e.description, type: e.type, seeders: e.seeders })))
    return { key: core.key, discoveryKey: core.discoveryKey }
  }

  const addBee = async (name, bees, setBees, db, store) => {
    const bee = { key: name, value: { readOnly: false }}
    setBees(e => [...e, bee])
    const { key, discoveryKey } = await addEntries(store, name, entries)
    db.put(name, { key: key.toString('hex'), discoveryKey: discoveryKey.toString('hex'), readOnly: false })
    props.setActiveBeeName(name)
    props.setView('main')
  }

  const parseSeederFile = (file) => {
    const parseLine = (line, next) => {
      const tokens = line.split(' ')
      const type = tokens[0]
      const key = tokens[1]
      const description = tokens.splice(3).join(' ')
      return { type, key, description: description.length > 1 ? description : 'No description provided.' }
    }
    return file.toString()
      .split('\n')
      .filter(e => e.length > 1 && e[0] !== '#' && e.split(' ')[0] !== 'seeder')
      .map((line, index, lines) => parseLine(line, lines[index + 1]))
      .map(e => ({ ...e, seeders: file.toString().includes('seeder ' + e.key.toString('hex')) }))
  }

  const onDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const onDrop = async (event) => {
    const file = event.dataTransfer.files[0]
    setEntries(parseSeederFile(await readFile(file.path)))
    setPath(file.path)
  }

  return html`
   <div id="add-bee">
     <input id="bee-name" type="text" spellcheck="false" placeholder="Name" onChange=${(e) => setName(e.target.value)}/>
     <div id="drag-and-drop" ondragover=${onDragOver} ondrop=${onDrop}>
       <p id="drag-and-drop-text"> ${path ? 'File: ' + path : 'Drag a seeder file here'} </p>
     </div>
     <p id="add-bee-button" class="${name ? 'enabled-button' : 'disabled-button'}" onclick=${async () => await addBee(name, props.bees, props.setBees, props.db, props.store)}>Add Seeder</p>
   </div>
`
}
export default AddBee