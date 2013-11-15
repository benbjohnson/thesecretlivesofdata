# Raft: Understandable Consensus

## Frames

### Intro

* h1="Raft", h2="Understandable Distributed Consensus"


### What is Distributed Consensus?

* h2="So what is Distributed Consensus?"

* h3="Let's start with an example:"

* h2="",
  h3="Let's say we have a single node system."
  addNode()

* h3="With only one node, we don't need consensus."

* h3="When a client makes a change to the state of the node, the change is immediate."
  addClient()
  client.send(node, "10")

* h3="Unfortunately, if our node dies then our system becomes unavailable temporarily."
  node.shutdown()

* h3="Or worse, we could lose our data entirely"
  removeNode(node)

* h3="To solve this, we add more nodes for redundancy."
  addNode(), addNode(), addNode()

* h3="Now we have a different problem: Replication"

* h3="We could choose one leader node to write to and all changes are copied to follower nodes"
  client.send(node1, "10")
  node1.send(node2, "10")
  node1.send(node3, "10")

* h3="This is called a replicated log."
  client.send(node1, "20")
  node1.send(node2, "20")
  node1.send(node3, "20")

* h3="But how do we get all nodes to agree on a leader?"

* h3="Distributed Consensus is about getting a group of distributed nodes to agree on a single value"

