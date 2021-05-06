import { CheckedCriteria } from "./CheckedCriteria";
import { SkillPoints } from "./SkillPoints";
import { AreaComment } from "./AreaComment";

export class Mode {
  constructor(modeId: number) {
    this.id = modeId;
  }

  id: number;
  checkedCriteria: CheckedCriteria[] = [];
  skillPoints: SkillPoints[] = [];
  areaComments: AreaComment[] = [];
}
