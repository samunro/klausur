import { Component } from "@angular/core";
import criteria from "./criteria.json";
import pointRanges from "./pointRanges.json";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  ngOnInit() {
    for (const part of criteria.parts) {
      for (const area of part.areas) {
        for (const skill of area.skills) {
          this.skillGrades.push({
            grade: 0,
            skillId: skill.id,
            pointRangeIds: []
          });
        }
      }
    }
  }

  criteria = criteria;
  pointRanges = pointRanges.items;

  skillGrades: SkillGrade[] = [];

  getGrade(skillId: number) {
    return this.getSkillGrade(skillId).grade;
  }

  setGrade(grade: number, skillId: number) {
    console.dir("setting grade");
    this.getSkillGrade(skillId).grade = grade;
  }

  private getSkillGrade(skillId: number) {
    return this.skillGrades.find(x => x.skillId === skillId);
  }

  isCriteriaChecked(pointRangeId: number, skillId: number) {
    const skill = this.getSkillGrade(skillId);

    return skill.pointRangeIds.includes(pointRangeId);
  }

  checkCriteria(isChecked: boolean, pointRangeId: number, skillId: number) {
    const skill = this.getSkillGrade(skillId);

    if (!isChecked) {
      skill.pointRangeIds = skill.pointRangeIds.filter(x => x !== pointRangeId);
    } else {
      if (!skill.pointRangeIds.includes(pointRangeId)) {
        skill.pointRangeIds.push(pointRangeId);
      }
    }

    this.setGrade(this.calculatedGrade(skillId), skillId);
  }

  calculatedGrade(skillId: number) {
    const skill = this.getSkillGrade(skillId);

    if (!skill.pointRangeIds.length) return 0;

    const averagePointGrades = this.pointRanges
      .filter(x => skill.pointRangeIds.includes(x.id))
      .map(x => (x.minimum + x.maximum) / 2);

    return Math.round(this.average(averagePointGrades));
  }

  private average(elements: number[]) {
    const sum = this.sum(elements);

    return sum / elements.length;
  }

  private sum(elements: number[]) {
    return elements.reduce((a, b) => a + b, 0);
  }

  private getArea(areaId: number){
    for(const part of criteria.parts){
      const area = part.areas.find(x => x.id === areaId);

      if(area) return area;
    }

    throw Error(`Could not find the ares with id ${areaId}.`)
  }

  getGradeForArea(areaId: number) {
    const area = this.getArea(areaId);

    return this.average(area.skills.map(x => this.getGrade(x.id)));
  }

  getTotalGrade() {
    const grades: number[] = [];

    for(const part of this.criteria.parts){
      for(const area of part.areas){
        grades.push(this.getGradeForArea(area.id));
      }
    }

    return Math.round(
      this.average(grades)
    );
  }

  getCriteria(skillId: number, pointRangeId: number) {
    for(const part of this.criteria.parts){
      for(const area of part.areas){
        const skill = area.skills.find(x => x.id === skillId);

        if(skill) return skill.criteria.filter(x => x.pointRangeId === pointRangeId);
      }
    }

      throw Error(`Could not find the skill with id ${skillId}.`);
  }
}

class SkillGrade {
  skillId: number;
  grade: number;
  pointRangeIds: number[];
}
