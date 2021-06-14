import { ThrowTally } from "../entities";
import { BowlingScoreCalculator } from "./bowling-calc.service";

export class ScoreCardService {
    constructor (
        private bowlingScoreCalculator: BowlingScoreCalculator = new BowlingScoreCalculator()
    ) {

    }

    public computeScores(throwTally: ThrowTally) {

    }
}