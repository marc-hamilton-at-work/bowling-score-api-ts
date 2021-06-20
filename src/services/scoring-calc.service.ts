import { FrameScore, ScoreCard, ThrowTally } from '../models';
import { BowlingScoreError, InvalidPinCombinationError } from '../shared/BowlingScoreError.error';

/**
 * The purpose of this class is to manage the business logic for calculating a bowling score.
 * As a best practice, this class does not keep state, so it must be passed the entire state
 * of a player's game in order to compute the score.
 * 
 */

 export class BowlingScoreCalculator {
    constructor (
    ) {
    }

    /**
     * If the player knocks down all ten pins on the first throw, that's called a strike.
     * The frame score for a strike adds in the next 2 throws.
     * 
     * @param throwTally
     * @param frameIndex 
     * @param throwSum 
     * @returns 
     */
    private handleStrikeScenario(throwTally: ThrowTally, frameIndex: number, throwSum: number): number {
        let frameScoreValue: number = throwSum;
        const nextThrow = throwTally.getFrame(frameIndex + 1)[0];
        let secondThrow = throwTally.getFrame(frameIndex + 1)[1];

        // Only apply this logic if we're on frames 1 through 8 (assuming a 10 frame game)
        if (nextThrow === ThrowTally.MAX_PINS && frameIndex < ThrowTally.MAX_FRAMES -2) {
            secondThrow = throwTally.getFrame(frameIndex + 2)[0];
        }

        frameScoreValue += (nextThrow + secondThrow);

        return frameScoreValue;
    }

    /**
     * An alternative to the srike is the spare, in which the player knocks down all
     * 10 pins using both throws of 1 frame.
     *  
     * @param throwTally 
     * @param frameIndex 
     * @param throwSum 
     * @returns 
     */
    private handleSpareScenario(throwTally: ThrowTally, frameIndex: number, throwSum: number): number {
        let frameScoreValue: number = throwSum;
    
        frameScoreValue += throwTally.getFrame(frameIndex + 1)[0];

        return frameScoreValue;
    }

    private validateAndComputeFrame(frameThrows: number[], frameIndex: number): number {

        if (frameIndex === ThrowTally.MAX_FRAMES - 1) {
            if (frameThrows[0] < ThrowTally.MAX_PINS && frameThrows[1] > ThrowTally.MAX_PINS - frameThrows[0]) {
                throw new InvalidPinCombinationError(frameIndex);
            }

            if (frameThrows[1] < ThrowTally.MAX_PINS && frameThrows[2] > ThrowTally.MAX_PINS - frameThrows[1]) {
                throw new InvalidPinCombinationError(frameIndex);
            }

            if (frameThrows[0] + frameThrows[1] < ThrowTally.MAX_PINS && frameThrows[2] > 0) {
                throw new InvalidPinCombinationError(frameIndex);
            }
        }

        let frameScoreValue: number = frameThrows.reduce((accumulater: number, currentValue: number) => {
            const frameSum = accumulater + currentValue;

            if (frameIndex < ThrowTally.MAX_FRAMES - 1 && frameSum > ThrowTally.MAX_PINS) {
                throw new InvalidPinCombinationError(frameIndex);
            }

            if (frameIndex === ThrowTally.MAX_FRAMES - 1 && frameSum > ThrowTally.MAX_PINS * 3) {
                throw new InvalidPinCombinationError(frameIndex);
            }

            return frameSum;
        });

        return frameScoreValue;
    }

    /**
     * Computes the individual sum for a given frame. Note that this does not accummulate
     * from the prior frames.
     * 
     * @param throwTally
     * @param frameIndex 
     * @returns 
     */
    private computeFrameScoreValue(throwTally: ThrowTally, frameIndex: number): number {
        const frameThrows: number[] = throwTally.getFrame(frameIndex);
    
        // get the sum of all throws in the frame
        let frameScoreValue: number = this.validateAndComputeFrame(frameThrows, frameIndex);

        // Handle special cases where all 10 pins are knocked down in a frame
        if (frameScoreValue === ThrowTally.MAX_PINS && frameIndex < ThrowTally.MAX_FRAMES - 1) {
            if (frameThrows[0] === ThrowTally.MAX_PINS) {
                frameScoreValue = this.handleStrikeScenario(throwTally, frameIndex, frameScoreValue);                
            }
            else {
                frameScoreValue = this.handleSpareScenario(throwTally, frameIndex, frameScoreValue);
            }
        }

        return (frameScoreValue);
    }

    /**
     * Creates and computes the values for a ScoreCard object which represents the
     * accumulated scores for each frame as well as the final score.
     *
     * @param throwTally
     * @returns 
     */
    public computeScoreCard(throwTally: ThrowTally): ScoreCard {    
        const scoreCard = new ScoreCard();
        let scoreTotal = 0;

        for (let i: number = 0; i < ThrowTally.MAX_FRAMES; i++) {
            const frameThrows: number[] = throwTally.getFrame(i);
            let frameScoreValue: number = this.computeFrameScoreValue(throwTally, i);

            scoreTotal += frameScoreValue;

            const frameScore: FrameScore = new FrameScore(frameThrows, scoreTotal);

            scoreCard.addFrameScore(frameScore);
            scoreCard.finalScore = scoreTotal;
        }

        return scoreCard;
    }
}