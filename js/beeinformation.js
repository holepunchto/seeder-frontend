import { html } from 'htm/preact'

function BeeInformation (props) {
  if (props.bee) {
    return html`
   <div id="view-public-key">
     <p id="view-public-key-value">Public key: ${props.bee.core.key.toString('hex')}</p>
     <p id="core-peers">Peers length: ${props.bee.core.peers.length}</p>
   </div>
`
  }
}

export default BeeInformation
