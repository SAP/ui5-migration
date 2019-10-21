export class Range {
	private beginning: number;
	private end: number;

	constructor(beginning, end) {
		this.beginning = beginning;
		this.end = end;

		if (this.beginning > this.end) {
			throw new Error("beginning must be smaller than end");
		}
	}

	getBeginning(): number {
		return this.beginning;
	}

	getEnd(): number {
		return this.end;
	}

	static from(beginning, end) {
		return new Range(beginning, end);
	}

	static fromArray(aArray) {
		return new Range(aArray[0], aArray[1]);
	}

	/**
	 *
	 * @param otherRange
	 * @returns whether or not there is at least one element which is in common
	 * in the 2 ranges
	 */
	isOverlappedBy(otherRange: Range): boolean {
		// other range should contain beginning
		if (
			this.getBeginning() > otherRange.getBeginning() &&
			this.getBeginning() < otherRange.getEnd()
		) {
			return true;
		}
		// other range should contain end
		else if (
			this.getEnd() > otherRange.getBeginning() &&
			this.getEnd() < otherRange.getEnd()
		) {
			return true;

			// this range should contain other beginning
		} else if (
			otherRange.getBeginning() > this.getBeginning() &&
			otherRange.getBeginning() < this.getEnd()
		) {
			return true;
		}

		return false;
	}
}
