
define(["../../scripts/model/model", "../../scripts/model/log_entry", "../../../scripts/domReady/domReady-2.0.1!"], function (Model, LogEntry, doc) {
    describe('Node', function(){
        var assert = chai.assert,
            frame = null,
            model = null,
            node  = null;

        beforeEach(function() {
            var player = playback.player().frame("TEST", "TEST", function () {});
            player.model(new Model());
            frame = player.current();
            model = frame.model();
            node = model.nodes.create("a");
        });

        describe('#initialize()', function(){
            it('should initialize as a follower', function(){
                assert.equal(node.state(), "follower");
            });

            it('should initialize with model', function(){
                assert.strictEqual(node.model(), model);
            });
        });

        describe('#bbox()', function(){
            it('should return a bbox around the circle', function(){
                node.x = 10;
                node.y = 20;
                node.r = 5
                var bbox = node.bbox()
                assert(bbox.equal(tsld.bbox(15, 15, 25, 5)));
            });
        });

        describe('#execute()', function(){
            it('should append a log entry', function(){
                node.currentTerm(3);
                node.state("leader");
                node.execute("SET 5");
                assert.equal(1, node._log.length);
                assert.equal(1, node._log[0].index);
                assert.equal(3, node._log[0].term);
                assert.equal("SET 5", node._log[0].command);

                node.execute("SET 10");
                assert.equal(2, node._log.length);
                assert.equal(2, node._log[1].index);
                assert.equal("SET 10", node._log[1].command);
            });
        });

        describe('#nextIndex()', function(){
            it('should default to 1', function(){
                assert.equal(1, node.nextIndex("a"));
            });

            it('should set and return value', function(){
                node.nextIndex("a", 2);
                assert.equal(2, node.nextIndex("a"));
            });
        });

        describe('#matchIndex()', function(){
            var a, b, c;

            beforeEach(function () {
                a = node;
                b = model.nodes.create("b");
                c = model.nodes.create("c");
                a.cluster([a, b, c]);
                b.cluster([a, b, c]);
                c.cluster([a, b, c]);
                a.state("candidate");
                a.state("leader");
            });

            it('should default to 0', function(){
                assert.equal(0, node.matchIndex("b"));
            });

            it('should set and return value', function(){
                node.matchIndex("b", 2);
                assert.equal(2, node.matchIndex("b"));
            });

            it('should update commit index to highest quorum', function(){
                node._log = [new LogEntry(1, 1, "SET 10"), new LogEntry(2, 1, "SET 5")];
                node.matchIndex("b", 1);
                assert.equal(1, node.commitIndex());
                node.matchIndex("c", 2);
                assert.equal(2, node.commitIndex());
            });
        });

        describe('#currentTerm()', function(){
            it('should update the term and change to "follower" if term is higher', function(){
                node.currentTerm(10);
                node.state("candidate");    // Bumps to term 11.
                node.currentTerm(12);
                assert.equal(12, node.currentTerm());
                assert.equal("follower", node.state());
            });

            it('should not change if the term is lower or equal to current', function(){
                node.currentTerm(10);
                node.state("candidate")     // Bumps to term 11.
                node.currentTerm(9);
                node.currentTerm(10);
                assert.equal(11, node.currentTerm());
                assert.equal("candidate", node.state());
            });
        });

        describe('#sendAppendEntriesRequest()', function(){
            var a, b, c;

            beforeEach(function () {
                a = node;
                b = model.nodes.create("b");
                c = model.nodes.create("c");
                a.cluster([a, b, c]);
                b.cluster([a, b, c]);
                c.cluster([a, b, c]);
                a.state("candidate");
                a.state("leader");
            });

            it('should send an AE Request message to a follower', function () {
                var message = a.sendAppendEntriesRequest(b);
                assert.equal("AEREQ", message.payload.type);
                assert.equal(1, message.payload.term);
                assert.equal("a", message.payload.leaderId);
                assert.equal(0, message.payload.prevLogIndex);
                assert.equal(0, message.payload.prevLogTerm);
                assert.deepEqual([], message.payload.log);
                assert.equal(0, message.payload.leaderCommit);
            });

            it('should receive an AE heartbeat message from the leader', function () {
                var req = {
                    type: "AEREQ",
                    term: 1,
                    leaderId: "a",
                    prevLogIndex: 0,
                    prevLogTerm: 0,
                    log: [],
                    leaderCommit: 0,
                };
                var message = b.recvAppendEntriesRequest(a, req);
                assert.equal("AERSP", message.payload.type);
                assert.equal(1, message.payload.term);
                assert.equal(true, message.payload.success);
            });

            it('should receive an AE with initial logs from the leader', function () {
                var req = {
                    type: "AEREQ",
                    term: 1,
                    leaderId: "a",
                    prevLogIndex: 0,
                    prevLogTerm: 0,
                    log: [new LogEntry(1, 1, "SET 10"), new LogEntry(2, 1, "SET 5")],
                    leaderCommit: 0,
                };
                var message = b.recvAppendEntriesRequest(a, req);
                assert.equal("AERSP", message.payload.type);
                assert.equal(1, message.payload.term);
                assert.equal(true, message.payload.success);
                assert.deepEqual(req.log, b._log);
            });

            it('should receive an AE with more logs from the leader', function () {
                var message = b.recvAppendEntriesRequest(a, {term: 1, leaderId: "a", prevLogIndex: 0, prevLogTerm: 0, log: [new LogEntry(1, 1, "SET 3"), new LogEntry(2, 1, "SET 8")], leaderCommit: 0});
                assert.equal(true, message.payload.success);

                var req = {
                    type: "AEREQ",
                    term: 2,
                    leaderId: "a",
                    prevLogIndex: 2,
                    prevLogTerm: 1,
                    log: [new LogEntry(3, 2, "SET 7")],
                    leaderCommit: 1,
                };
                var message = b.recvAppendEntriesRequest(a, req);
                assert.equal("AERSP", message.payload.type);
                assert.equal(2, message.payload.term);
                assert.equal(true, message.payload.success);
                assert.equal(3, b._log.length);
                assert.equal(1, b._log[0].index);
                assert.equal(2, b._log[1].index);
                assert.equal(3, b._log[2].index);

                assert.equal(3, b.value());
            });

            it('should return unsuccessful message if AE has stale term', function () {
                var req = {term: 1};
                b.currentTerm(2);
                var message = b.recvAppendEntriesRequest(a, req);
                assert.equal(2, message.payload.term);
                assert.equal(false, message.payload.success);
            });
        });
    });
});
