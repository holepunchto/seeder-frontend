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
      props.setEntries(e => [...e, { key: Id.decode(key), value: { description, type, seeders } }])
      props.setView('main')
    }
  }

  const onKeyChange = (key) => {
    try {
      setKey(key)
      Id.decode(key)
      setError(false)
    } catch (e) {
      setError(true)
    }
  }

  return html`
   <div class="add-form">
     <p class="${error && key && key.length ? 'key-error' : 'disabled'}"> Invalid Hypercore key </p>
     <input class="public-key" type="text" spellcheck="false" placeholder="Public key" oninput=${(e) => onKeyChange(e.target.value)}/>
     <input class="description" type="text" spellcheck="false" placeholder="Description" onchange=${(e) => setDescription(e.target.value)}/>
     <select class="select-type" onchange=${(e) => setType(e.target.value)}>
       <option value="core">core</option>
       <option value="bee">bee</option>
       <option value="drive">drive</option>
     </select>
     <label class="seeders-checkbox">Seeders<input type="checkbox" class="checkbox" onchange=${(e) => setSeeders(e.target.checked)}/></label>
     <p class="${!error && key ? 'add-button enabled-button' : 'add-button disabled-button'}" onclick=${createEntry}>Add Entry</p>
   </div>
`
}

export default AddEntry
