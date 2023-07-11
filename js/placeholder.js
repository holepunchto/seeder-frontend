import { html } from 'htm/preact'

function Placeholder (props) {
  return html`
   <div class="${props.bees.length && props.activeBeeName ? 'disabled' : 'placeholder'}">
     <h3> Select a seeder or create new one using the "New..." button </h3>
   </div>
`
}
export default Placeholder
