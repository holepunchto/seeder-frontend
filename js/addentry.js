import { html } from 'htm/preact'

function AddEntry (props) {
  return html`
   <div id="add-form" class="disabled">
     <input id="public-key" type="text" spellcheck="false" placeholder="Public key">
     <input id="description" type="text" spellcheck="false" placeholder="Description">
     <select id="select-type">
       <option value="core">core</option>
       <option value="bee">bee</option>
       <option value="drive">drive</option>
     </select>
     <p id="add-button" class="disabled-button">Add Entry</p>
   </div>
`
}
export default AddEntry
