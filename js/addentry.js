import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import Id from 'hypercore-id-encoding'

function AddEntry (props) {
  const [key, setKey] = useState(null)
  const [type, setType] = useState('core') // default value
  const [description, setDescription] = useState(null)
  const [seeders, setSeeders] = useState(false)
  const [error, setError] = useState(false)

  const createEntry = () => {
    if (!error && key) {
      props.bee.put(key, { description, type, seeders })
      props.setEntries(e => [...e, { key, value: { description, type, seeders } }])
      props.setView('main')
    }
  }

  const onKeyChange = (key) => {
    try {
      Id.encode(Buffer.from(key, 'hex'))
      setError(false)
      setKey(key)
    } catch (e) {
      setError(true)
    }
  }

  return html`
   <div id="add-form">
     <p class="${error ? 'key-error' : 'disabled'}"> Invalid Hypercore key </p>
     <input id="public-key" type="text" spellcheck="false" placeholder="Public key" oninput=${(e) => onKeyChange(e.target.value)}/>
     <input id="description" type="text" spellcheck="false" placeholder="Description" onchange=${(e) => setDescription(e.target.value)}/>
     <select id="select-type" onchange=${(e) => setType(e.target.value)}>
       <option value="core">core</option>
       <option value="bee">bee</option>
       <option value="drive">drive</option>
     </select>
     <label class="seeders-checkbox">Seeders<input type="checkbox" class="checkbox" onchange=${(e) => setSeeders(e.target.checked)}/></label>
     <p id="add-button" class="${!error && key ? 'enabled-button' : 'disabled-button'}" onclick=${createEntry}>Add Entry</p>
   </div>
`
}

export default AddEntry
