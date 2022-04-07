import assert from 'assert';

describe('I am a pointless test:', () => {
    
    it('this test should have never run.', (done) => {
        assert.fail('Test Ran', 'Skip Test', 'Something is wrong with the automatic tests, this test should not have been automatically run.');
        done(); 
    });

});
