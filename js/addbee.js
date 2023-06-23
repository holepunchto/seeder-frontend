import { readFile } from 'fs/promises'
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import SeedBee from 'seedbee'
import Id from 'hypercore-id-encoding'

function AddBee (props) {
  const [name, setName] = useState(null)
  const [entries, setEntries] = useState([])
  const [path, setPath] = useState(null)
  const [readonly, setReadonly] = useState(false)
  const [key, setKey] = useState(null)

  const addEntries = async (store, name, entries) => {
    const core = store.get({ name })
    const bee = new SeedBee(core)
    await core.ready()
    await bee.ready()
    await Promise.all(entries.map(e => bee.put(e.key, { description: e.description, type: e.type, seeders: e.seeders })))
    return { key: core.key, discoveryKey: core.discoveryKey }
  }

  const addBee = async (name) => {
    const bee = { key: name, value: { readonly: false } }
    props.setBees(e => [...e, bee])
    const { key, discoveryKey } = await addEntries(props.store, name, entries)
    props.db.put(name, { key: key.toString('hex'), discoveryKey: discoveryKey.toString('hex'), readonly: false })
    props.setActiveBeeName(name)
    props.setView('main')
  }

  const addRemoteBee = async (key) => {
    const core = props.store.get(Id.decode(key))
    await core.ready()
    props.swarm.join(core.discoveryKey)

    const bee = { key: name, value: { key: core.key.toString('hex'), discoveryKey: core.discoveryKey.toString('hex'), readonly: true } }
    props.db.put(name, { key, discoveryKey: core.discoveryKey.toString('hex'), readonly: true })
    props.setBees(e => [...e, bee])
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
     <div id="drag-and-drop" class="${readonly ? 'disabled' : ''}" ondragover=${onDragOver} ondrop=${onDrop}>
       <p id="drag-and-drop-text"> ${path ? 'File: ' + path : 'Drag a seeder file here'} </p>
     </div>
     <div class="readonly">
       <label>Read only</label><input type="checkbox" class="checkbox" onchange=${(e) => setReadonly(e.target.checked)}/>
       <input class="${readonly ? 'remote-key' : 'disabled'}" type="text" spellcheck="false" placeholder="Public key" onchange=${(e) => setKey(e.target.value)}/>
     </div>
     <p id="add-bee-button" class="${name ? 'enabled-button' : 'disabled-button'}" onclick=${async () => readonly ? await addRemoteBee(key) : await addBee(name)}>Add Seeder</p>
   </div>
`
}
export default AddBee
