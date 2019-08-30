const chai = require('chai');
const expect = chai.expect; 
require('mocha-sinon');
Object.assign(global, require('../src/hoffy.js'));

// use to test console output while still allowing console.log
// to _actually_ output to screen
// source: http://stackoverflow.com/a/30626035
function mockConsoleOutput() {
    const log = console.log;
    this.sinon.stub(console, 'log').callsFake(function() {
        return log.apply(log, arguments);
    });
}
describe('hoffy', function() {
    describe('parseMoves', function() {

        it('converts string to move objects', function() {
            expect(parseMoves('😎💻ABACAA')).to.deep.equal([
              { val: '😎', col: 'A' },
              { val: '💻', col: 'B' },
              { val: '😎', col: 'A' },
              { val: '💻', col: 'C' },
              { val: '😎', col: 'A' },
              { val: '💻', col: 'A' }
            ]);
        });
    });
    describe('shortestString', function() {

        it('shortest string is returned', function() {
            expect(shortestString('fooo', 'barrrr', 'bazzy', 'qux', 'quxx')).to.equal('qux');
        });
        it('last string is returned if same length', function() {
            expect(shortestString('f', 'g', 'abc')).to.equal('g');
        });
        it('returns undefined if no arguments passed in', function() {
            expect(shortestString()).to.be.undefined;
        });
    });

    describe('repeatCall', function() {

        beforeEach(mockConsoleOutput);

        it('calls function n times', function() {
            const n = 2;
            repeatCall(console.log, n, "Hello!");
            expect(console.log.callCount).to.equal(n);
            expect(console.log.alwaysCalledWithExactly('Hello!')).to.be.true;
        });
    });

    describe('repeatCallAllArgs', function() {

        beforeEach(mockConsoleOutput);

        it('calls function n times, allows arbitrary number of arguments', function() {
            const n = 2;
            repeatCallAllArgs(console.log, n, "foo", "bar", "baz", "qux", "quxx", "corge");
            expect(console.log.callCount).to.equal(n);
            expect(console.log.alwaysCalledWithExactly('foo','bar', 'baz', 'qux', 'quxx', 'corge')).to.be.true;
        });
    });

    describe('steppedForEach', function() {

        beforeEach(mockConsoleOutput);

        it('calls function on sub sections of array', function() {
            steppedForEach([1, 2, 3, 4, 5, 6], (a, b, c) => console.log('' + a + b + c),  3);
            expect(console.log.callCount).to.equal(2);
        });
        it('calls function on sub sections of array, even if last section contains partial number of elements', function() {
            steppedForEach([1, 2, 3, 4, 5, 6, 7], (a, b, c) => console.log('' + a + b + c),  3);
            expect(console.log.callCount).to.equal(3);
        });
    });


    describe('constrainDecorator', function() {

        it('returns a function that calls the original function ... and allows the return value of the original function to be returned without modification if it is between (inclusive) min and max', function() {
            const constrainedParseInt = constrainDecorator(parseInt, -10, 10);
            expect(constrainedParseInt("7")).to.equal(7);
            expect(constrainedParseInt("-10")).to.equal(-10);
            expect(constrainedParseInt("10")).to.equal(10);
            expect(constrainedParseInt("0")).to.equal(0);
        });

        it('returns a function that calls the original function ... and when either max or min are not present or undefined, the new function will just give back the return value of the old function, without any constraints', function() {
            const constrainedParseInt = constrainDecorator(parseInt);
            expect(constrainedParseInt("-12")).to.equal(-12);
            expect(constrainedParseInt("12")).to.equal(12);
        });

        it('returns a function that sets the return value of the original function to min if return value of original is less than min', function() {
            const constrainedParseInt = constrainDecorator(parseInt, -10, 10);
            expect(constrainedParseInt("-12")).to.equal(-10);
        });

        it('returns a function that sets the return value of the original function to max if return value of original is less than max', function() {
            const constrainedParseInt = constrainDecorator(parseInt, -10, 10);
            expect(constrainedParseInt("12")).to.equal(10);
        });
    });

    describe('limitCallsDecorator', function() {

        beforeEach(mockConsoleOutput);

        it('decorates a function so that it can only be called a specified number of times', function() {
            const n = 3;
            const limitedParseInt = limitCallsDecorator(parseInt, 3);
            expect(limitedParseInt("423")).to.equal(423);
            expect(limitedParseInt("423")).to.equal(423);
            expect(limitedParseInt("423")).to.equal(423);
            expect(limitedParseInt("423")).to.be.undefined;
            // console.log(limitedParseInt("423"));
        });
    });
    describe('bundleArgs', function() {
      function toBeBundled(first, second, third) {
          return [third, second, first].join(' ');
      }

      it('returns a function with first param filled if given one arg', function(done) {
          const withFirst = bundleArgs(toBeBundled, "one");
          expect(withFirst("two", "three")).to.eql("three two one");
          done();
      });

      it('returns a function with two params filled if given two args', function(done) {
          const withFirstTwo = bundleArgs(toBeBundled, "one",  "two");
          expect(withFirstTwo("three")).to.eql("three two one");
          done();
      });

      it('returns a function with all params filled if given all args', function(done) {
          const withFirstThree = bundleArgs(toBeBundled, "one", "two", "three");
          expect(withFirstThree("anything", "else")).to.eql("three two one");
          done();
      });

      it('returns a function that can be used in it again', function(done) {
          expect(bundleArgs(bundleArgs(bundleArgs(toBeBundled, "one"), "two"), "three")()).to.eql("three two one");
          done();
      });
    });

    describe('sequence', function(done) {

      it('returns a function calls all functions', function(done) {
        let fns = [...Array(3)].map(() => this.sinon.fake())
        sequence(...fns)()
        expect(fns.every(fn => fn.calledOnce)).to.be.true;

        done()
      })

      it("returns a function that calls all in order", function(done) {
        const one = s => s + "one"
        const two = s => s + "two"
        const three = s => s + "three"
        expect(sequence(one, two, three)("zero")).to.eql("zeroonetwothree")
        done()
      })

    })
});
