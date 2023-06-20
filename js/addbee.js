import { html } from 'htm/preact'

function AddBee (props) {
  return html`
   <div id="add-bee" class="disabled">
     <input id="bee-name" type="text" spellcheck="false" placeholder="Name">
     <div id="drag-and-drop">
       <p id="drag-and-drop-text"> Drag a seeder file here </p>
     </div>
     <p id="add-bee-button" class="disabled-button">Add Seeder</p>
   </div>
`
}
export default AddBee
