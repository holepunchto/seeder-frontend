import { html } from 'htm/preact'

function Placeholder (props) {
  return html`
   <div id="placeholder" class="${props.entries.length ? 'disabled' : ''}">
     <h3> Select a seeder or create new one using the "New..." button </h3>
   </div>
`
}
export default Placeholder
