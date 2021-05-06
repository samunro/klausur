import { SkillWeighting } from "./SkillWeighting";

export class ExamDefinition {
  teacher: string;
  city: string;
  school: string;
  course: string;
  "type": string;
  modes: { id: number, isEnabled: boolean, weighting: number; skillWeightings: SkillWeighting[]; }[] = [];
}
