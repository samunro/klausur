import { Component } from "@angular/core";
import master from "./master.json";
import pointRanges from "./pointRanges.json";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  ngOnInit() {
    for (const part of master.parts) {
      for (const area of part.areas) {
        this.areaComments.push({ areaId: area.id, comment: null });

        const skillCount = part.areSkillWeightingsFixed
          ? area.skills.length
          : 3;

        let skillWeighting = 100 / skillCount;

        if (!part.areSkillWeightingsFixed) {
          skillWeighting = Math.round(skillWeighting);
        }

        let count = 0;

        const areaSkillPoints: SkillPoints[] = [];

        for (const skill of area.skills) {
          const isIncluded = part.areSkillWeightingsFixed || count < 3;

          areaSkillPoints.push({
            skillId: skill.id,
            points: 0,
            weighting:
              count < 3 || part.areSkillWeightingsFixed ? skillWeighting : 0,
            isWeightingFixed: part.areSkillWeightingsFixed,
            isIncluded: isIncluded
          });

          count++;

          for (const criteria of skill.criteria) {
            this.checkedCriteria.push({
              criteriaId: criteria.id,
              isChecked: false
            });
          }
        }

        areaSkillPoints[0].weighting +=
          100 - this.sum(areaSkillPoints.map(x => x.weighting));

        this.skillPoints.push(...areaSkillPoints);
      }
    }
  }

  master = master;
  pointRanges = pointRanges.items.sort((a, b) => a.minimum - b.minimum);

  private exam: Exam = new Exam();
  private checkedCriteria: CheckedCriteria[] = [];
  private skillPoints: SkillPoints[] = [];
  private areaComments: AreaComment[] = [];

  student: string;

  get teacher() {
    return this.exam.teacher;
  }

  set teacher(value: string) {
    this.exam.teacher = value;
  }

  get school() {
    return this.exam.school;
  }

  set school(value: string) {
    this.exam.school = value;
  }

  get examType() {
    return this.exam.type;
  }

  set examType(value: string) {
    this.exam.type = value;
  }

  isPrintView: boolean = false;

  togglePrintView() {
    this.isPrintView = !this.isPrintView;
  }

  getPointsForSkill(skillId: number) {
    return this.getSkillPoints(skillId).points;
  }

  setPointsForSkill(points: number, skillId: number) {
    this.getSkillPoints(skillId).points = points;
  }

  getSkillPoints(skillId: number) {
    return this.skillPoints.find(x => x.skillId === skillId);
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
    return this.checkedCriteria.find(x => x.criteriaId === criteriaId);
  }

  private getSkill(skillId: number) {
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

  getPointsForArea(areaId: number) {
    const area = this.getArea(areaId);

    return this.sum(
      area.skills.map(
        x =>
          (this.getPointsForSkill(x.id) * this.getSkillPoints(x.id).weighting) /
          100
      )
    );
  }

  getPointsForPart(partId: number) {
    const part = this.master.parts.find(x => x.id === partId);

    const points: number[] = [];

    for (const area of part.areas) {
      points.push(this.getPointsForArea(area.id));
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

  getTotalPoints() {
    let result = 0;

    for (const part of master.parts) {
      result += (part.weighting / 100) * this.getPointsForPart(part.id);
    }

    return Math.round(result);
  }

  getSkillWeighting(skillId: number) {
    return this.getSkillPoints(skillId).weighting;
  }

  setSkillWeighting(value: number, skillId: number) {
    if (value > 100) {
      value = 100;
    } else if (value < 0) {
      value = 0;
    }

    this.getSkillPoints(skillId).weighting = value;
  }

  isSkillIncluded(skillId: number) {
    return this.getSkillPoints(skillId).isIncluded;
  }

  setSkillIncluded(value: boolean, skillId: number) {
    this.getSkillPoints(skillId).isIncluded = value;
  }

  getTotalAreaWeightings(areaId: number) {
    const weightings = this.getAreaSkillPoints(areaId).map(x => x.weighting);

    return this.sum(weightings);
  }

  getAreaSkillsCount(areaId: number) {
    return this.getAreaSkillPoints(areaId).filter(x => x.isIncluded).length;
  }

  private getAreaSkillPoints(areaId: number) {
    const skillIds = this.getArea(areaId).skills.map(x => x.id);

    return this.skillPoints.filter(x => skillIds.includes(x.skillId));
  }

  getComment(areaId: number) {
    return this.getAreaComment(areaId).comment;
  }

  setComment(value: string, areaId: number) {
    this.getAreaComment(areaId).comment = value;
  }

  private getAreaComment(areaId: number) {
    return this.areaComments.find(x => x.areaId === areaId);
  }

  getCheckCriteriaForSkill(skillId: number) {
    return this.getSkill(skillId)
      .criteria.filter(x => this.isCriteriaChecked(x.id))
      .map(x => x.text);
  }

  saveExam() {
    this.download(this.exam, "Klausur Definition.json");
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

  async loadExam(event: Event){
    const content = await (event.target as HTMLInputElement).files[0].text();

    this.exam = JSON.parse(content);
  }
}

class CheckedCriteria {
  criteriaId: number;
  isChecked: boolean;
}

class SkillPoints {
  skillId: number;
  points: number;
  weighting: number;
  isWeightingFixed: boolean;
  isIncluded: boolean;
}

class SkillWeighting {
  skillId: number;
  weighting: number;
  isWeightingFixed: boolean;
  isIncluded: boolean;
}

class AreaComment {
  areaId: number;
  comment: string;
}

class Exam {
  teacher: string;
  school: string;
  "type": string;
}
