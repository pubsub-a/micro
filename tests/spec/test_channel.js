if (typeof window === "undefined") {
  var PubSub = require("../../dist/pubsub-micro").PubSub;
  var expect = require("chai").expect;
} else {
  var PubSub = PubSubMicro.PubSub;
}


describe('Channel tests', function() {

    var pubsub;

    beforeEach(function() {
        pubsub = new PubSub();
    });

    it("should create a channel synchronously", function() {
        var channel = pubsub.channel("foo");
        expect(channel.constructor.name).to.equal("Channel");
    });

    it("should create a channel asynchronously", function(done) {
        var channel;

        pubsub.channel("foo", function(chan) {
            expect(chan.constructor.name).to.equal("Channel");
            done();
        });
    });

    it("should not share pubsub data between two channels of different name", function(done) {
        var channel1 = pubsub.channel("channel1");
        var channel2 = pubsub.channel("channel2");

        channel1.subscribe("foo", function() {
            expect(true).to.be.true;
            setTimeout(done, 250);
        });

        // if this is called, data is shared amgonst differently named channels so we fail
        channel2.subscribe("foo", function() {
            expect(false).to.be.true;
        });

        channel1.publish("foo", {});
    });

    it("should have two channel instances with same name share the pubsub data", function(done) {
        var foo1 = pubsub.channel("foo");
        var foo2 = pubsub.channel("foo");

        foo1.subscribe("bar", function() {
            expect(true).to.be.true;
            done();
        });

        foo2.publish("bar", {});
    });
});
