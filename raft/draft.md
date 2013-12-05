##
Nodes A, B, C
"Raft is a protocol for implementing distributed consensus."

##
"Let's look at a high level overview of how it works."

##
"First a node will change to a <em>candidate</em> state.""
A.state = "candidate"

##
"The candidate will then request votes to become the <em>leader</em>.""
A.send(A, B)
A.send(A, C)

##
"The other nodes will response with a vote for the candidate node.""
A.send(B, A)
A.send(C, A)

##
"Once a majority of votes is received, the candidate becomes the <em>leader</em>."
A.state = "leader"

##
"This is called <em>leader election</em>."


##
"Once a leader is elected, all changes are made through the leader node."
Client "X"
X.value = 8
send(X, A)

##
"Each change is written to a log."
A.log.append("SET 8")

##
"Then the log is replicated to the <em>follower</em> nodes."
send(A, B, 1000)
send(A, C, 1000)
B.log.append("SET 8")
C.log.append("SET 8")
etc, etc.

##
"The follower nodes notify the leader that they have written the log changes"
send(B, A, 1000)
send(C, A, 1000)

##
The log entry is <em>committed</em> once it is committed on a majority of nodes.
A.commitIndex = 1;
A.value = "8"

##
The leader then notifies followers of the committed entry.
send(A, B, 1000)
send(A, C, 1000)
B.commitIndex = C.commitIndex = 1;
B.value = C.value = "8"

##
"This is called <em>log replication</em>."

