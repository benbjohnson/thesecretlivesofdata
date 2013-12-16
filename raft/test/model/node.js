
define(["../../scripts/model/model", "../../../scripts/domReady/domReady-2.0.1!"], function (Model, doc) {
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
        });
    });
});
