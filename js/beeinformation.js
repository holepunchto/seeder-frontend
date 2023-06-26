import { html } from 'htm/preact'

function BeeInformation (props) {
  if (props.bee) {
    return html`
   <div class="view-public-key">
     <p class="view-public-key-value">Public key: ${props.bee.core.key.toString('hex')}</p>
     <p class="core-peers">Peers length: ${props.bee.core.peers.length}</p>
   </div>
`
  }
}

export default BeeInformation
