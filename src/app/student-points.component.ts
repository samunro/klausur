import { Component } from "@angular/core";
import master from "./master.json";
import pointRanges from "./pointRanges.json";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  ngOnInit() {
    const sprachmittlungMode = master.modes.find(x => x.id === 2);

    for (const mode of master.modes.map(x => new Mode(x.id))) {
      const isSprachmittlung = mode.id === sprachmittlungMode.id;

      this.exam.modes.push(mode);

      for (const part of master.parts) {
        for (const area of part.areas) {
          mode.areaComments.push({ areaId: area.id, comment: null });

          const areSkillWeightingsFixed = this.areSkillWeightingsFixed(part.id, mode.id);

          const skillCount = areSkillWeightingsFixed
            ? area.skills.length
            : 3;

          let skillWeighting = 100 / skillCount;

          if (!areSkillWeightingsFixed) {
            skillWeighting = Math.round(skillWeighting);
          }

          let count = 0;

          const areaSkillPoints: SkillWeighting[] = [];

          for (const skill of area.skills) {
            if(skill.shouldIncludeInSprachmittlung !== null && skill.shouldIncludeInSprachmittlung !== isSprachmittlung) continue;

            mode.skillPoints.push({ skillId: skill.id, points: 0 });

            const isIncluded = areSkillWeightingsFixed || count < 3;

            areaSkillPoints.push({
              skillId: skill.id,
              weighting:
                count < 3 || areSkillWeightingsFixed ? skillWeighting : 0,
              isWeightingFixed: areSkillWeightingsFixed,
              isIncluded: isIncluded
            });

            count++;

            for (const criteria of skill.criteria) {
              mode.checkedCriteria.push({
                criteriaId: criteria.id,
                isChecked: false
              });
            }
          }

          areaSkillPoints[0].weighting +=
            100 - this.sum(areaSkillPoints.map(x => x.weighting));

          this.examDefinition.skillWeightings.push(...areaSkillPoints);
        }
      }
    }
  }

  master = master;
  pointRanges = pointRanges.items.sort((a, b) => a.minimum - b.minimum);

  private examDefinition = new ExamDefinition();
  private exam = new Exam();

  get modeName() {
    return this.master.modes.find(x => x.id === this.mode.id).name;
  }

  private get mode() {
    const modeId = this.isSprachmittlung ? 2 : 1;

    return this.exam.modes.find(x => x.id === modeId);
  }

  isSprachmittlung = false;

  get student() {
    return this.exam.student;
  }

  set student(value: string) {
    this.exam.student = value;
  }

  get teacher() {
    return this.examDefinition.teacher;
  }

  set teacher(value: string) {
    this.examDefinition.teacher = value;
  }

  get city() {
    return this.examDefinition.city;
  }

  set city(value: string) {
    this.examDefinition.city = value;
  }

  get school() {
    return this.examDefinition.school;
  }

  set school(value: string) {
    this.examDefinition.school = value;
  }

  get course() {
    return this.examDefinition.course;
  }

  set course(value: string) {
    this.examDefinition.course = value;
  }

  get examType() {
    return this.examDefinition.type;
  }

  set examType(value: string) {
    this.examDefinition.type = value;
  }

  isPrintView: boolean = false;

  togglePrintView() {
    this.isPrintView = !this.isPrintView;
  }

  getPointsForSkill(skillId: number, modeId: number = null) {
    return this.getSkillPoints(skillId, modeId).points;
  }

  setPointsForSkill(points: number, skillId: number) {
    this.getSkillPoints(skillId).points = points;
  }

  getSkillPoints(skillId: number, modeId: number = null) {
    const mode = modeId === null ? this.mode : this.exam.modes.find(x => x.id === modeId);

    return mode.skillPoints.find(x => x.skillId === skillId);
  }

  isCriteriaChecked(criteriaId: number) {
    return this.getCheckedCriteria(criteriaId).isChecked;
  }

  toggleCriteria(criteriaId: number, skillId: number) {
    const checkedCriteria = this.getCheckedCriteria(criteriaId);

    checkedCriteria.isChecked = !checkedCriteria.isChecked;

    const skillPoints = this.getSkillPoints(skillId);

    skillPoints.points = this.calculatePointsForSkill(skillId);
  }

  private getCheckedCriteria(criteriaId: number) {
    return this.mode.checkedCriteria.find(x => x.criteriaId === criteriaId);
  }

  getSkill(skillId: number) {
    for (const part of this.master.parts) {
      for (const area of part.areas) {
        const skill = area.skills.find(x => x.id === skillId);

        if (skill) return skill;
      }
    }

    throw Error(`Skill with id ${skillId} was not found.`);
  }

  calculatePointsForSkill(skillId: number) {
    const criteria = this.getSkill(skillId).criteria;

    let criteriaPoints: number[] = [];

    for (const criterion of criteria) {
      const checkedCriteria = this.getCheckedCriteria(criterion.id);

      if (!checkedCriteria.isChecked) continue;

      const pointRange = this.pointRanges.find(
        x => x.id === criterion.pointRangeId
      );

      criteriaPoints.push((pointRange.minimum + pointRange.maximum) / 2);
    }

    return Math.round(this.average(criteriaPoints));
  }

  private average(elements: number[]) {
    const sum = this.sum(elements);

    return sum / elements.length;
  }

  private sum(elements: number[]) {
    return elements.reduce((a, b) => a + b, 0);
  }

  private getArea(areaId: number) {
    for (const part of this.master.parts) {
      const area = part.areas.find(x => x.id === areaId);

      if (area) return area;
    }

    throw Error(`Could not find the ares with id ${areaId}.`);
  }

  getPointsForArea(areaId: number, modeId: number = null) {
    const skills = this.getSkillsForArea(areaId, modeId);

    return this.sum(
      skills.map(
        x => (this.getPointsForSkill(x.id, modeId) * this.getSkillWeighting(x.id)) / 100
      )
    );
  }

  getSkillsForArea(areaId: number, modeId: number = null){
    const mode = modeId === null ? this.mode : this.exam.modes.find(x => x.id === modeId);

    const skillIds = mode.skillPoints.map(x => x.skillId);

    const area = this.getArea(areaId);

    return area.skills.filter(x => skillIds.includes(x.id));
  }

  getPointsForPart(partId: number, modeId: number = null) {
    const part = this.master.parts.find(x => x.id === partId);

    const points: number[] = [];

    for (const area of part.areas) {
      points.push(this.getPointsForArea(area.id, modeId));
    }

    return Math.round(this.average(points));
  }

  getCriteria(skillId: number, pointRangeId: number) {
    for (const part of this.master.parts) {
      for (const area of part.areas) {
        const skill = area.skills.find(x => x.id === skillId);

        if (skill)
          return skill.criteria.filter(x => x.pointRangeId === pointRangeId);
      }
    }

    throw Error(`Could not find the skill with id ${skillId}.`);
  }

  getTotalPoints(){
    var totalWeightings = this.sum(this.master.modes.map(x => x.weighting));

    return this.sum(this.master.modes.map(x => x.weighting * this.getPointsForMode(x.id))) / totalWeightings;
  }

  getPointsForMode(modeId: number = null) {
    let result = 0;

    for (const part of master.parts) {
      result += (part.weighting / 100) * this.getPointsForPart(part.id, modeId);
    }

    return Math.round(result);
  }

  getSkillWeighting(skillId: number) {
    return this.getSkillWeightingObject(skillId).weighting;
  }

  setSkillWeighting(value: number, skillId: number) {
    if (value > 100) {
      value = 100;
    } else if (value < 0) {
      value = 0;
    }

    this.getSkillWeightingObject(skillId).weighting = value;
  }

  private getSkillWeightingObject(skillId: number) {
    return this.examDefinition.skillWeightings.find(x => x.skillId === skillId);
  }

  isSkillIncluded(skillId: number) {
    return this.getSkillWeightingObject(skillId).isIncluded;
  }

  setSkillIncluded(value: boolean, skillId: number) {
    this.getSkillWeightingObject(skillId).isIncluded = value;
  }

  getTotalAreaWeightings(areaId: number) {
    const weightings = this.getIncludedAreaSkillWeightings(areaId).map(
      x => x.weighting
    );

    return this.sum(weightings);
  }

  getAreaSkillsCount(areaId: number) {
    return this.getIncludedAreaSkillWeightings(areaId).length;
  }

  getIncludedAreaSkillWeightings(areaId: number) {
    return this.getAreaSkillWeightings(areaId).filter(x => x.isIncluded);
  }

  private getAreaSkillWeightings(areaId: number) {
    const skillIds = this.getArea(areaId)
    .skills
    .filter(x => x.shouldIncludeInSprachmittlung === null || x.shouldIncludeInSprachmittlung === this.isSprachmittlung)
    .map(x => x.id);

    return this.examDefinition.skillWeightings.filter(x =>
      skillIds.includes(x.skillId)
    );
  }

  getComment(areaId: number) {
    return this.getAreaComment(areaId).comment;
  }

  setComment(value: string, areaId: number) {
    this.getAreaComment(areaId).comment = value;
  }

  private getAreaComment(areaId: number) {
    return this.mode.areaComments.find(x => x.areaId === areaId);
  }

  getCheckCriteriaForSkill(skillId: number) {
    return this.getSkill(skillId)
      .criteria.filter(x => this.isCriteriaChecked(x.id))
      .map(x => x.text);
  }

  saveExamDefinition() {
    this.download(this.examDefinition, "Klausur Definition.json");
  }

  async loadExamDefinition(event: Event) {
    const content = await (event.target as HTMLInputElement).files[0].text();

    this.examDefinition = JSON.parse(content);
  }

  saveExam() {
    this.download(this.exam, "Klausur.json");
  }

  async loadExam(event: Event) {
    const content = await (event.target as HTMLInputElement).files[0].text();

    this.exam = JSON.parse(content);
  }

  private download(data: object, filename, type = "application/json") {
    var file = new Blob([JSON.stringify(data)], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  get year() {
    return new Date().getUTCFullYear();
  }

  get date() {
    return new Date().toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
      day: "numeric"
    });
  }

  areSkillWeightingsFixed(partId: number, modeId: number = null){
    const isSprachmittlung = modeId !== null ? modeId === 2 : this.isSprachmittlung;

    if(isSprachmittlung) return true;

    return partId !== 1; //Inhalt;
  }
}

class CheckedCriteria {
  criteriaId: number;
  isChecked: boolean;
}

class SkillPoints {
  skillId: number;
  points: number;
}

class AreaComment {
  areaId: number;
  comment: string;
}

class ExamDefinition {
  teacher: string;
  city: string;
  school: string;
  course: string;
  "type": string;
  skillWeightings: SkillWeighting[] = [];
}

class SkillWeighting {
  skillId: number;
  weighting: number;
  isWeightingFixed: boolean;
  isIncluded: boolean;
}

class Mode {
  constructor(modeId: number){
    this.id = modeId;
  }

  id: number;
  checkedCriteria: CheckedCriteria[] = [];
  skillPoints: SkillPoints[] = [];
  areaComments: AreaComment[] = [];
}

class Exam {
  student: string;
  modes: Mode[] = [];
}
