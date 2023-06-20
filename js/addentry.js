import { html } from 'htm/preact'
import { useState } from 'preact/hooks'

function AddEntry (props) {
  const [key, setKey] = useState(null)
  const [type, setType] = useState('core') // default value
  const [description, setDescription] = useState(null)

  const createEntry = () => {
    props.bee.put(key, { description, type })
    props.setEntries(e => [...e, { key, value: { description, type } }])
    props.setView('main')
  }

  return html`
   <div id="add-form">
     <input id="public-key" type="text" spellcheck="false" placeholder="Public key" onchange=${(e) => setKey(e.target.value)}/>
     <input id="description" type="text" spellcheck="false" placeholder="Description" onchange=${(e) => setDescription(e.target.value)}/>
     <select id="select-type" onchange=${(e) => setType(e.target.value)}>
       <option value="core">core</option>
       <option value="bee">bee</option>
       <option value="drive">drive</option>
     </select>
     <p id="add-button" class="disabled-button" onclick=${createEntry}>Add Entry</p>
   </div>
`
}

export default AddEntry
