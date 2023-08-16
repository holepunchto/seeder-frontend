import { readFile } from 'fs/promises'
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import SeedBee from 'seedbee'
import Id from 'hypercore-id-encoding'

const ALLOWED_PEERS = 'simple-seeder/allowed-peers'
const SWARM_PUBLIC_KEY = 'simple-seeder/swarm-public-key'

function AddBee (props) {
  const [name, setName] = useState(null)
  const [entries, setEntries] = useState([])
  const [path, setPath] = useState(null)
  const [readonly, setReadonly] = useState(false)
  const [key, setKey] = useState(null)
  const [error, setError] = useState(false)
  const [allowedPeers, setAllowedPeers] = useState(null)

  const addEntries = async (store, name, entries) => {
    const core = store.get({ name })
    const bee = new SeedBee(core)
    await core.ready()
    await bee.ready()
    await Promise.all(entries.map(e => bee.put(e.key, { description: e.description, type: e.type, seeders: e.seeders })))
    if (allowedPeers) bee.metadata.put(ALLOWED_PEERS, allowedPeers.split(',').map(e => e.trim()))
    bee.metadata.put(SWARM_PUBLIC_KEY, props.swarm.keyPair.publicKey.toString('hex'))
    return { key: core.key, discoveryKey: core.discoveryKey }
  }

  const addBee = async (name) => {
    if (!name) return
    const bee = { key: name, value: { readonly: false }, allowedPeers }
    props.setBees(e => [...e, bee])
    const { key, discoveryKey } = await addEntries(props.store, name, entries)
    props.db.put(name, { key: key.toString('hex'), discoveryKey: discoveryKey.toString('hex'), readonly: false })
    props.setActiveBeeName(name)
    props.setView('main')
    props.swarm.join(discoveryKey)
  }

  const addRemoteBee = async (key) => {
    if (error || !name || !key) return
    const core = props.store.get(Id.decode(key))
    await core.ready()
    props.swarm.join(core.discoveryKey)

    const bee = { key: name, value: { key: core.key.toString('hex'), discoveryKey: core.discoveryKey.toString('hex'), readonly: true } }
    props.db.put(name, { key: Id.decode(key).toString('hex'), discoveryKey: core.discoveryKey.toString('hex'), readonly: true })
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

  const onKeyChange = (key) => {
    try {
      Id.decode(key)
      setError(false)
      setKey(key)
    } catch (e) {
      setError(true)
    }
  }

  return html`
   <div class="add-bee">
     <input class="bee-name" type="text" spellcheck="false" placeholder="Name" oninput=${(e) => setName(e.target.value)}/>
     <textarea class="${readonly ? 'disabled' : ''}" id="peers-list" placeholder="Allowed peers (leave the field empty if you want to allow all peers)"  oninput=${(e) => setAllowedPeers(e.target.value)}></textarea>
     <div class="${readonly ? 'disabled' : 'drag-and-drop'}" ondragover=${onDragOver} ondrop=${onDrop}>
       <p class="drag-and-drop-text"> ${path ? 'File: ' + path : 'Drag a seeder file here'} </p>
     </div>
     <div class="readonly">
       <label>Read only</label><input type="checkbox" class="checkbox" onchange=${(e) => setReadonly(e.target.checked)}/>
       <p class="${error && readonly ? 'key-error' : 'disabled'}"> Invalid Hypercore key </p>
       <input class="${readonly ? 'remote-key' : 'disabled'}" type="text" spellcheck="false" placeholder="Public key" oninput=${(e) => onKeyChange(e.target.value)}/>
     </div>
     <p class="${((!error && key) || !readonly) && name ? 'add-bee-button enabled-button' : 'add-bee-button disabled-button'}" onclick=${async () => readonly ? await addRemoteBee(key) : await addBee(name, allowedPeers)}>Add Seeder</p>
   </div>
`
}
export default AddBee
