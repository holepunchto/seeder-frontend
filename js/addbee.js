import { html } from 'htm/preact'
import { useState } from 'preact/hooks'

function AddBee (props) {
  const [name, setName] = useState(null)

  const addBee = (name, bees, setBees, db) => {
    const bee = { key: name }
    setBees(e => [...e, bee])
    db.put(name)
  }

  return html`
   <div id="add-bee">
     <input id="bee-name" type="text" spellcheck="false" placeholder="Name" onChange=${(e) => setName(e.target.value)}/>
     <div id="drag-and-drop">
       <p id="drag-and-drop-text"> Drag a seeder file here </p>
     </div>
     <p id="add-bee-button" class="disabled-button" onclick=${async () => await addBee(name, props.bees, props.setBees, props.db)}>Add Seeder</p>
   </div>
`
}
export default AddBee
