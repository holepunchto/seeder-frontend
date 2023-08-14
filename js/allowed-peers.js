import { html } from 'htm/preact'
import { useRef, useEffect } from 'preact/hooks'

const ALLOWED_PEERS = 'simple-seeder/allowed-peers'

function AllowedPeers (props) {
  const allowedPeers = useRef(null)

  useEffect(async () => {
    const peers = await props.bee.metadata.get(ALLOWED_PEERS)
    allowedPeers.current.value = peers
  }, [])

  const acceptOnClick = () => {
    const peers = allowedPeers.current.value
    if (peers.length === 0) {
      props.bee.metadata.del(ALLOWED_PEERS)
    } else {
      props.bee.metadata.put(ALLOWED_PEERS, peers.split(',').map(e => e.trim()))
    }
    props.setView('main')
  }

  return html`
   <div class="allowed-peers">
     <textarea id="peers-list" placeholder="Allowed peers (leave the field empty if you want to allow all peers)" ref=${allowedPeers}></textarea>
   </div>
   <p class="allowed-peers-button enabled-button" onclick=${acceptOnClick}>Accept</p>
`
}

export default AllowedPeers
