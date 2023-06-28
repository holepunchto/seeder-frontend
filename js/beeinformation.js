import { html } from 'htm/preact'
import Id from 'hypercore-id-encoding'

function BeeInformation (props) {
  if (props.bee) {
    return html`
   <div class="view-public-key">
     <p class="view-public-key-value">Public key: <span class="monospace">${Id.encode(props.bee.core.key)}</span></p>
     <p class="core-peers">Peers length: ${props.bee.core.peers.length}</p>
   </div>
`
  }
}

export default BeeInformation
